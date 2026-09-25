"""
BipeSend TTS Service — XTTSv2-based voice cloning and synthesis.

Endpoints:
  POST /v1/tts/clone         — Clone a voice from an audio sample
  POST /v1/tts/synthesize    — Synthesize speech from text using a voice
  GET  /v1/tts/voices        — List all available voices (built-in + cloned)
  DELETE /v1/tts/voices/{id} — Delete a cloned voice

Architecture:
  - Built-in voices live in app/voices/ with a voices.json manifest
  - Cloned voices are saved in app/speakers/
  - XTTSv2 uses the original audio as speaker embedding at synthesis time
  - Audio is converted to WAV 22050Hz mono for optimal XTTSv2 quality
"""

import os

os.environ["COQUI_TOS_AGREED"] = "1"

import io
import json
import time
import uuid
import wave
import base64
import asyncio
import logging
import subprocess
import re
from pathlib import Path
from typing import Optional

import torch

# ─── PyTorch 2.6+ Compatibility Patch ────────────────────────────────────────
# TTS 0.22.0 checkpoints contain custom Python objects (XttsConfig, etc.)
# PyTorch 2.6+ defaults torch.load(weights_only=True) which blocks these.
# We patch torch.load to default to weights_only=False for Coqui TTS checkpoints.
_original_torch_load = torch.load

def _patched_torch_load(*args, **kwargs):
    if "weights_only" not in kwargs:
        kwargs["weights_only"] = False
    return _original_torch_load(*args, **kwargs)

torch.load = _patched_torch_load
# ─── End torch.load Patch ─────────────────────────────────────────────────────

# ─── torchaudio Backend Patch (soundfile) ───────────────────────────────────────
# On Windows, torchaudio C++ audio backends / torchcodec fail without full-shared FFmpeg.
# We patch torchaudio.load and torchaudio.save directly with soundfile (pure Python/libsndfile).
import soundfile as sf
import torchaudio

def _patched_torchaudio_load(filepath, *args, **kwargs):
    data, sr = sf.read(str(filepath), dtype="float32")
    if data.ndim == 1:
        tensor = torch.from_numpy(data).unsqueeze(0)
    else:
        tensor = torch.from_numpy(data.T)
    return tensor, int(sr)

def _patched_torchaudio_save(filepath, src, sample_rate, *args, **kwargs):
    if isinstance(src, torch.Tensor):
        src = src.detach().cpu().numpy()
    if src.ndim == 2:
        src = src.T
    sf.write(str(filepath), src, int(sample_rate))

torchaudio.load = _patched_torchaudio_load
torchaudio.save = _patched_torchaudio_save
# ─── End torchaudio Patch ─────────────────────────────────────────────────────

import hashlib
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.config import settings
from app.storage import voice_storage, tenant_storage

logger = logging.getLogger("bipesend.tts")

tts_router = APIRouter(prefix="/v1/tts", tags=["Text-to-Speech"])

# ─── Redis Cache & In-Memory Fallback ───────────────────────────────────────
_redis_client = None
_redis_checked = False
_memory_cache = {}  # In-memory LRU fallback
_synthesis_semaphore = asyncio.Semaphore(settings.TTS_MAX_CONCURRENT_SYNTHESIS)

def _get_redis():
    global _redis_client, _redis_checked
    if _redis_checked and _redis_client is None:
        return None
    if _redis_client is not None:
        return _redis_client
    try:
        import redis
        client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=1.5)
        client.ping()
        _redis_client = client
        _redis_checked = True
        logger.info(f"Connected to Redis for TTS caching at {settings.REDIS_URL}")
        return _redis_client
    except Exception as e:
        logger.warning(f"Redis unavailable for TTS cache: {e}. Using in-memory fallback cache.")
        _redis_checked = True
        _redis_client = None
        return None

def _get_cache_key(
    voice_id: str,
    language: str,
    text: str,
    max_audio_seconds: float,
    temperature: float = 0.70,
    speed: float = 1.0,
    repetition_penalty: float = 4.0,
    top_k: int = 50,
    top_p: float = 0.85,
) -> str:
    clean = text.strip().lower()
    params = f"{voice_id}:{language}:{max_audio_seconds:.1f}:{temperature:.2f}:{speed:.2f}:{repetition_penalty:.1f}:{top_k}:{top_p:.2f}:{clean}"
    h = hashlib.sha256(params.encode("utf-8")).hexdigest()[:24]
    duration_tag = f"d{int(max_audio_seconds)}" if max_audio_seconds > 0 else "full"
    return f"tts:cache:{voice_id}:{duration_tag}:{h}"

def _get_cached_synthesis(cache_key: str) -> Optional[dict]:
    if not settings.TTS_CACHE_ENABLED:
        return None
    r = _get_redis()
    if r:
        try:
            val = r.get(cache_key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.warning(f"Redis cache read error: {e}")
    return _memory_cache.get(cache_key)

def _set_cached_synthesis(cache_key: str, data: dict) -> None:
    if not settings.TTS_CACHE_ENABLED:
        return
    r = _get_redis()
    if r:
        try:
            r.setex(cache_key, settings.TTS_CACHE_TTL_SECONDS, json.dumps(data))
        except Exception as e:
            logger.warning(f"Redis cache write error: {e}")
    if len(_memory_cache) > 300:
        oldest = next(iter(_memory_cache))
        _memory_cache.pop(oldest, None)
    _memory_cache[cache_key] = data

# ─── Paths ────────────────────────────────────────────────────────────────────
APP_DIR = Path(__file__).parent
VOICES_DIR = APP_DIR / "voices"
SPEAKERS_DIR = APP_DIR / "speakers"
VOICES_MANIFEST = VOICES_DIR / "voices.json"

VOICES_DIR.mkdir(exist_ok=True)
SPEAKERS_DIR.mkdir(exist_ok=True)

# ─── XTTSv2 Model (lazy singleton) ───────────────────────────────────────────
_tts_model = None
_tts_device = None
_model_lock = asyncio.Lock() if hasattr(asyncio, "Lock") else None


def _get_device() -> str:
    """Detect best available device for inference."""
    import torch

    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def _load_model():
    """Load the XTTSv2 model (blocking, call once on startup or first use)."""
    global _tts_model, _tts_device
    if _tts_model is not None:
        return _tts_model

    import torch
    from TTS.api import TTS

    import os
    os.environ["COQUI_TOS_AGREED"] = "1"

    # PyTorch 2.6+ compatibility for Coqui TTS checkpoint loading
    _orig_torch_load = torch.load
    def _safe_torch_load(*args, **kwargs):
        kwargs["weights_only"] = False
        return _orig_torch_load(*args, **kwargs)
    torch.load = _safe_torch_load

    # Torchaudio soundfile patch (avoids torchcodec requirement on Windows)
    try:
        import soundfile as sf
        import torchaudio
        def _safe_torchaudio_load(filepath, *args, **kwargs):
            data, samplerate = sf.read(filepath)
            tensor = torch.from_numpy(data).float()
            if tensor.ndim == 1:
                tensor = tensor.unsqueeze(0)
            else:
                tensor = tensor.t()
            return tensor, samplerate
        torchaudio.load = _safe_torchaudio_load
    except Exception as e:
        logger.warning(f"Could not patch torchaudio with soundfile: {e}")

    _tts_device = _get_device()
    use_gpu = (_tts_device == "cuda")
    logger.info(f"Loading XTTSv2 (gpu={use_gpu}, device={_tts_device.upper()})...")

    try:
        _tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=use_gpu)
        logger.info("XTTSv2 loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load XTTSv2: {e}")
        raise RuntimeError(f"XTTSv2 failed to load: {e}")

    return _tts_model


async def _get_model():
    """Thread-safe model access (loads on first call)."""
    global _tts_model
    if _tts_model is not None:
        return _tts_model
    # Load in a thread to avoid blocking the event loop
    return await asyncio.to_thread(_load_model)


# ─── Audio Conversion Utilities ──────────────────────────────────────────────
def _ensure_ffmpeg_on_path() -> bool:
    """Ensure ffmpeg directory is on os.environ['PATH']."""
    try:
        res = subprocess.run(["ffmpeg", "-version"], capture_output=True, timeout=3)
        if res.returncode == 0:
            return True
    except Exception:
        pass

    # Check WinGet location on Windows
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    if local_app_data:
        winget_packages = Path(local_app_data) / "Microsoft" / "WinGet" / "Packages"
        if winget_packages.exists():
            for p in winget_packages.glob("**/ffmpeg.exe"):
                bin_dir = p.parent
                os.environ["PATH"] = f"{bin_dir};{os.environ.get('PATH', '')}"
                logger.info(f"Auto-configured FFmpeg on PATH from WinGet: {bin_dir}")
                return True
    return False


def _has_ffmpeg() -> bool:
    """Check if ffmpeg is available on PATH."""
    return _ensure_ffmpeg_on_path()


def _convert_to_wav_ffmpeg(input_path: Path, output_path: Path) -> Path:
    """Convert any audio file to WAV 22050Hz mono using ffmpeg."""
    cmd = [
        "ffmpeg",
        "-y",  # overwrite
        "-i",
        str(input_path),
        "-ar",
        "22050",  # sample rate
        "-ac",
        "1",  # mono
        "-acodec",
        "pcm_s16le",  # 16-bit PCM
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, timeout=60)
    if result.returncode != 0:
        stderr = result.stderr.decode("utf-8", errors="replace")
        raise RuntimeError(f"ffmpeg conversion failed: {stderr[:500]}")
    return output_path


def _convert_to_wav_pydub(input_path: Path, output_path: Path) -> Path:
    """Fallback: Convert audio using pydub (requires ffmpeg on PATH)."""
    from pydub import AudioSegment

    audio = AudioSegment.from_file(str(input_path))
    # Convert to mono, 22050Hz, 16-bit
    audio = audio.set_channels(1).set_frame_rate(22050).set_sample_width(2)
    audio.export(str(output_path), format="wav")
    return output_path


def convert_to_wav(input_path: Path, output_path: Path) -> Path:
    """Convert audio to WAV 22050Hz mono. Uses ffmpeg if available, else torchaudio."""
    if _has_ffmpeg():
        return _convert_to_wav_ffmpeg(input_path, output_path)
    return _convert_to_wav_pydub(input_path, output_path)


def _get_audio_duration_seconds(wav_path: Path) -> float:
    """Get duration of a WAV file in seconds."""
    try:
        with wave.open(str(wav_path), "r") as w:
            frames = w.getnframes()
            rate = w.getframerate()
            return frames / float(rate)
    except Exception:
        return 0.0


def _trim_audio_to_max_duration(wav_path: Path, max_seconds: float) -> Path:
    """
    Clips audio to max_seconds applying a smooth 0.15s fade-out to prevent pop/click.
    Guarantees audio output never exceeds the agent's maxAudioSeconds configuration.
    """
    if max_seconds <= 0:
        return wav_path
    try:
        data, sr = sf.read(str(wav_path), dtype="float32")
        duration = len(data) / float(sr)
        if duration <= max_seconds:
            return wav_path

        max_samples = int(max_seconds * sr)
        trimmed = data[:max_samples].copy()

        # Apply smooth 0.15s fade out
        fade_samples = min(int(0.15 * sr), len(trimmed))
        if fade_samples > 0:
            import numpy as np
            fade = np.linspace(1.0, 0.0, fade_samples, dtype="float32")
            if trimmed.ndim == 1:
                trimmed[-fade_samples:] *= fade
            else:
                trimmed[-fade_samples:] *= fade[:, None]

        sf.write(str(wav_path), trimmed, int(sr))
        logger.info(f"Trimmed audio from {duration:.2f}s to {max_seconds:.2f}s (maxAudioSeconds guardrail)")
    except Exception as e:
        logger.warning(f"Failed to trim audio to max duration: {e}")
    return wav_path


def _post_process_audio(wav_path: Path):
    """
    OpenAI-inspired Audio Master Post-Processing:
    1. Dead-silence trimming at attack and release with natural padding.
    2. Peak Loudness Normalization to -1.0 dBFS (0.891 amplitude) for broadcast clarity.
    """
    try:
        import numpy as np
        data, sr = sf.read(str(wav_path), dtype="float32")
        if data.size == 0:
            return
        
        # 1. Dead-silence trimming
        thresh = 0.008  # ~ -42 dB threshold
        indices = np.where(np.abs(data) > thresh)[0]
        if len(indices) > 0:
            pad_start = int(sr * 0.04)  # 40ms attack padding
            pad_end = int(sr * 0.08)    # 80ms decay padding
            start_idx = max(0, indices[0] - pad_start)
            end_idx = min(len(data), indices[-1] + pad_end)
            data = data[start_idx:end_idx]

        # 2. Peak normalization to -1.0 dBFS
        max_val = np.max(np.abs(data))
        if max_val > 0.01:
            data = data * (0.891 / max_val)

        sf.write(str(wav_path), data, int(sr))
    except Exception as e:
        logger.warning(f"Audio post-processing note: {e}")


# ─── Voice Registry ──────────────────────────────────────────────────────────
def _load_builtin_voices() -> dict:
    """Load built-in voices from voices.json manifest."""
    voices = {}
    if VOICES_MANIFEST.exists():
        try:
            data = json.loads(VOICES_MANIFEST.read_text(encoding="utf-8"))
            for v in data.get("builtin_voices", []):
                voice_id = v["id"]
                source = VOICES_DIR / v["source_file"]
                wav_path = VOICES_DIR / f"{voice_id}.wav"

                # Convert to WAV if needed (only on first startup)
                if source.exists() and not wav_path.exists():
                    logger.info(f"Converting built-in voice '{voice_id}' to WAV 22050Hz...")
                    try:
                        convert_to_wav(source, wav_path)
                        logger.info(f"Converted '{voice_id}' successfully.")
                    except Exception as e:
                        logger.warning(f"Failed to convert '{voice_id}': {e}. Using source directly.")
                        wav_path = source

                voices[voice_id] = {
                    "id": voice_id,
                    "name": v.get("name", voice_id),
                    "gender": v.get("gender", "unknown"),
                    "category": v.get("category", v.get("gender", "unknown")),
                    "language": v.get("language", "pt"),
                    "description": v.get("description", ""),
                    "type": "builtin",
                    "tenant_id": None,  # Builtin voices are global for all tenants
                    "audio_path": str(wav_path if wav_path.exists() else source),
                    "sample_url": f"/v1/tts/voices/{voice_id}/sample",
                    "r2_url": None,
                }
        except Exception as e:
            logger.error(f"Error loading voices.json: {e}")
    return voices


def _load_cloned_voices() -> dict:
    """Load cloned voices from the speakers directory."""
    voices = {}
    meta_files = list(SPEAKERS_DIR.glob("*.json"))
    for meta_file in meta_files:
        try:
            data = json.loads(meta_file.read_text(encoding="utf-8"))
            voice_id = data["id"]
            audio_path = SPEAKERS_DIR / data["audio_file"]

            # If audio missing locally, attempt download from R2 if configured
            if not audio_path.exists() and voice_storage.is_r2_enabled:
                synced = voice_storage.sync_from_r2_if_missing(voice_id, SPEAKERS_DIR)
                if synced:
                    audio_path = synced

            if audio_path.exists():
                voices[voice_id] = {
                    **data,
                    "type": "cloned",
                    "category": data.get("category", data.get("gender", "custom")),
                    "tenant_id": data.get("tenant_id"),
                    "audio_path": str(audio_path),
                    "sample_url": f"/v1/tts/voices/{voice_id}/sample",
                    "r2_url": data.get("r2_url"),
                }
        except Exception as e:
            logger.warning(f"Error loading cloned voice {meta_file.name}: {e}")
    return voices


def get_all_voices(tenant_id: Optional[str] = None) -> dict:
    """
    Get all available voices.
    Multi-tenant isolation:
      - Built-in voices are always available to all tenants.
      - Cloned voices are filtered by tenant_id when provided.
      - If tenant_id is None, returns all voices (SuperAdmin view).
    """
    voices = _load_builtin_voices()
    cloned = _load_cloned_voices()
    if tenant_id:
        cloned = {
            vid: v for vid, v in cloned.items()
            if v.get("tenant_id") == tenant_id or not v.get("tenant_id")
        }
    voices.update(cloned)
    return voices


def resolve_voice(voice_id: str, tenant_id: Optional[str] = None) -> str:
    """
    Resolve a voice_id to its audio file path.
    Enforces multi-tenant isolation: raises 403 if voice belongs to another tenant.
    """
    all_voices = _load_builtin_voices()
    all_voices.update(_load_cloned_voices())

    if voice_id not in all_voices:
        raise HTTPException(
            status_code=404,
            detail=f"Voz '{voice_id}' não encontrada.",
        )

    voice = all_voices[voice_id]
    if voice.get("type") == "cloned" and tenant_id:
        voice_tenant = voice.get("tenant_id")
        if voice_tenant and voice_tenant != tenant_id:
            raise HTTPException(
                status_code=403,
                detail=f"Acesso negado: a voz '{voice_id}' pertence exclusivamente a outro tenant.",
            )

    return voice["audio_path"]


# ─── Text Sanitization for Ultra-Realistic TTS ─────────────────────────────
def _sanitize_text_for_tts(text: str) -> str:
    """
    Clean text for TTS synthesis to prevent the model from speaking
    punctuation names or special characters literally.

    XTTSv2 interprets punctuation as prosodic cues:
      . = long pause    , = short pause    ! = emphasis    ? = rising tone

    This function removes stray characters that could confuse the model
    while preserving natural punctuation for realistic speech.
    """
    # Remove multiple consecutive punctuation (e.g. "..." → ".")
    text = re.sub(r'\.{2,}', '.', text)
    text = re.sub(r'\!{2,}', '!', text)
    text = re.sub(r'\?{2,}', '?', text)

    # Remove stray characters that have no phonetic meaning
    text = re.sub(r'[\*\#\~\`\|\\\{\}\[\]\<\>\^]', '', text)

    # Replace typographic quotes with plain ones
    text = re.sub(r'[\u201C\u201D\u201E]', '"', text)  # curly double quotes
    text = re.sub(r'[\u2018\u2019\u201A]', "'", text)  # curly single quotes

    # Replace em-dash and en-dash with comma (pause)
    text = re.sub(r'[\u2013\u2014—–]', ',', text)

    # Remove URLs (XTTSv2 would try to read them letter by letter)
    text = re.sub(r'https?://\S+', '', text)

    # Remove emoji (may cause garbled output)
    text = re.sub(r'[\U00010000-\U0010ffff]', '', text, flags=re.UNICODE)

    # Collapse excessive whitespace
    text = re.sub(r'\s{2,}', ' ', text).strip()

    return text


def _truncate_text_for_duration(text: str, max_audio_seconds: float) -> str:
    """
    Estimate and truncate text to fit within a maximum audio duration.

    Average TTS output rate is approximately 2.5 words/second for Portuguese.
    We use 2.2 words/second as a conservative estimate to avoid cutting
    mid-sentence.
    """
    if max_audio_seconds <= 0:
        return text

    words_per_second = 2.2
    max_words = int(max_audio_seconds * words_per_second)
    words = text.split()

    if len(words) <= max_words:
        return text

    # Truncate at the last complete sentence within the word limit
    truncated = ' '.join(words[:max_words])
    # Try to end at a sentence boundary
    last_sentence_end = max(
        truncated.rfind('.'),
        truncated.rfind('!'),
        truncated.rfind('?'),
    )
    if last_sentence_end > len(truncated) * 0.5:
        truncated = truncated[:last_sentence_end + 1]

    return truncated


# ─── Pydantic Models ─────────────────────────────────────────────────────────
class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1500)
    voice_id: str = Field(..., description="ID of the voice to use (e.g. germani, lucas, bia, or cloned_*)")
    language: str = Field("pt", description="Language code (pt, en, es, fr, de, it, etc.)")
    temperature: Optional[float] = Field(0.70, description="Sampling temperature (0.1 to 1.0)")
    speed: Optional[float] = Field(1.0, description="Velocidade da fala (0.5 a 2.0)")
    length_penalty: Optional[float] = Field(1.0, description="Length penalty")
    repetition_penalty: Optional[float] = Field(4.0, description="Repetition penalty (elimina gagueiras)")
    top_k: Optional[int] = Field(50, description="Top-K sampling")
    top_p: Optional[float] = Field(0.85, description="Top-P nucleus sampling")
    enable_text_splitting: Optional[bool] = Field(True, description="Divisão inteligente por pontuação para cadência humana fluida")
    max_audio_seconds: Optional[float] = Field(
        30.0, description="Max audio duration in seconds. 0 = unlimited. Default: 30s per message."
    )
    no_cache: Optional[bool] = Field(
        False, description="Forçar síntese neural ao vivo ignorando cache (ideal para estúdio de calibração)"
    )
    tenant_id: Optional[str] = Field(None, description="Tenant ID for multi-tenant voice isolation")


class VoiceCloneResponse(BaseModel):
    voice_id: str
    name: str
    status: str
    duration_seconds: float
    message: str
    category: str = "custom"
    tenant_id: Optional[str] = None
    sample_url: Optional[str] = None
    r2_url: Optional[str] = None


class SynthesizeResponse(BaseModel):
    audio_base64: str
    format: str = "wav"
    sample_rate: int = 22050
    latency_ms: int
    text_length: int
    voice_id: str
    duration_seconds: float = 0.0
    cached: bool = False


class AsyncSynthesizeResponse(BaseModel):
    job_id: str
    status: str  # "queued" | "completed"
    voice_id: str
    message: str
    cached: bool = False
    result: Optional[SynthesizeResponse] = None


class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # "queued" | "processing" | "completed" | "failed"
    progress: int
    voice_id: str
    result: Optional[SynthesizeResponse] = None
    error: Optional[str] = None
    created_at: str


class VoiceInfo(BaseModel):
    id: str
    name: str
    gender: str
    category: str = "custom"
    language: str = "pt"
    description: str = ""
    type: str  # "builtin" or "cloned"
    tenant_id: Optional[str] = None
    sample_url: Optional[str] = None
    r2_url: Optional[str] = None


class VoiceListResponse(BaseModel):
    voices: list[VoiceInfo]
    total: int


# In-memory Async Job Store (fallback for when Redis queue is offline)
_async_jobs: dict = {}


# ─── Endpoints ────────────────────────────────────────────────────────────────


@tts_router.get("/voices", response_model=VoiceListResponse)
async def list_voices(tenant_id: Optional[str] = Query(None, description="Filtrar vozes pelo Tenant ID")):
    """
    List all available voices.
    Multi-tenant isolation:
      - Built-in voices are always visible to all tenants.
      - Cloned voices are filtered by tenant_id.
      - If tenant_id is omitted, returns all voices (SuperAdmin view).
    """
    voices = get_all_voices(tenant_id=tenant_id)
    voice_list = [
        VoiceInfo(
            id=v["id"],
            name=v.get("name", v["id"]),
            gender=v.get("gender", "unknown"),
            category=v.get("category", "custom"),
            language=v.get("language", "pt"),
            description=v.get("description", ""),
            type=v.get("type", "unknown"),
            tenant_id=v.get("tenant_id"),
            sample_url=v.get("sample_url"),
            r2_url=v.get("r2_url"),
        )
        for v in voices.values()
    ]
    return VoiceListResponse(voices=voice_list, total=len(voice_list))


@tts_router.get("/voices/{voice_id}/sample")
async def get_voice_sample(voice_id: str, tenant_id: Optional[str] = Query(None)):
    """Return the reference audio sample of a voice for instant preview/playback."""
    audio_path_str = resolve_voice(voice_id, tenant_id=tenant_id)
    audio_path = Path(audio_path_str)
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found.")

    def iterfile():
        with open(audio_path, mode="rb") as f:
            yield from f

    return StreamingResponse(
        iterfile(),
        media_type="audio/wav",
        headers={
            "Content-Disposition": f"inline; filename={voice_id}_sample.wav",
            "Accept-Ranges": "bytes",
        },
    )


@tts_router.post("/clone", response_model=VoiceCloneResponse)
async def clone_voice(
    file: UploadFile = File(..., description="Audio sample (MP3, WAV, OGG, M4A, WEBM)"),
    name: str = Form(..., description="Display name for the voice"),
    gender: str = Form("female", description="Voice gender: female, male, child"),
    tenant_id: Optional[str] = Form(None, description="Tenant ID para isolamento multi-tenant"),
):
    """
    Clone a voice from an audio sample.
    Isolates cloned voice under the tenant's namespace and mirrors to Cloudflare R2 if configured.
    """
    allowed_extensions = (".mp3", ".wav", ".ogg", ".webm", ".mp4", ".m4a", ".flac")
    filename = file.filename or "upload.wav"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato de áudio '{ext}' não suportado. Permitidos: {', '.join(allowed_extensions)}",
        )

    voice_id = f"cloned_{uuid.uuid4().hex[:12]}"
    raw_path = SPEAKERS_DIR / f"{voice_id}_raw{ext}"
    wav_path = SPEAKERS_DIR / f"{voice_id}.wav"

    try:
        content = await file.read()
        if len(content) < 1000:
            raise HTTPException(status_code=400, detail="Arquivo de áudio muito curto. Mínimo 3 segundos.")
        raw_path.write_bytes(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar áudio: {str(e)}")

    try:
        convert_to_wav(raw_path, wav_path)
    except Exception as e:
        logger.warning(f"Conversão falhou, usando arquivo bruto: {e}")
        wav_path = raw_path

    duration = _get_audio_duration_seconds(wav_path)
    if duration < 1.0:
        raw_path.unlink(missing_ok=True)
        wav_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=400,
            detail=f"Áudio muito curto ({duration:.1f}s). Mínimo de 3 segundos de fala clara necessário.",
        )

    category = gender if gender in ("female", "male", "child") else "custom"
    sample_url = f"/v1/tts/voices/{voice_id}/sample"

    meta = {
        "id": voice_id,
        "name": name,
        "gender": gender,
        "category": category,
        "language": "pt",
        "tenant_id": tenant_id,
        "description": f"Voz clonada a partir de '{filename}'",
        "audio_file": wav_path.name,
        "raw_file": raw_path.name,
        "sample_url": sample_url,
        "r2_url": None,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    # Isolamento de armazenamento por tenant
    if tenant_id:
        try:
            tenant_storage.save_tenant_file(
                tenant_id=tenant_id,
                category="voices/reference",
                filename=wav_path.name,
                content=wav_path,
                content_type="audio/wav",
            )
        except Exception as e:
            logger.warning(f"Erro ao salvar arquivo no storage isolado do tenant {tenant_id}: {e}")

    # Upload para Cloudflare R2
    r2_url = None
    if voice_storage.is_r2_enabled:
        try:
            r2_url = voice_storage.save_voice_file(voice_id, wav_path)
            meta["r2_url"] = r2_url
            voice_storage.save_voice_metadata(voice_id, meta)
            logger.info(f"Voz {voice_id} enviada para Cloudflare R2: {r2_url}")
        except Exception as e:
            logger.warning(f"Falha ao enviar voz para Cloudflare R2: {e}")

    meta_path = SPEAKERS_DIR / f"{voice_id}.json"
    meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")

    return VoiceCloneResponse(
        voice_id=voice_id,
        name=name,
        status="ready",
        duration_seconds=round(duration, 1),
        message=f"Voz '{name}' clonada com sucesso ({duration:.1f}s de áudio de referência).",
        category=category,
        tenant_id=tenant_id,
        sample_url=sample_url,
        r2_url=r2_url,
    )


@tts_router.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize_speech(request: SynthesizeRequest):
    """
    Synthesize speech from text using a specified voice with:
      - Multi-tenant voice resolution guard
      - Redis caching for instant responses (sub-10ms)
      - maxAudioSeconds duration limitation
      - Concurrency throttling to prevent event-loop freezing
    """
    start_time = time.time()

    # 1. Resolve voice with multi-tenant check
    speaker_wav_path = resolve_voice(request.voice_id, tenant_id=request.tenant_id)

    # 2. Sanitize and pre-truncate text for duration
    clean_text = _sanitize_text_for_tts(request.text)
    max_seconds = request.max_audio_seconds or 0.0
    if max_seconds > 0:
        clean_text = _truncate_text_for_duration(clean_text, max_seconds)

    if not clean_text.strip():
        raise HTTPException(
            status_code=400,
            detail="O texto fornecido está vazio após sanitização.",
        )

    # 3. Check Redis / Memory cache for instant response (unless no_cache is explicitly requested)
    temp = float(request.temperature if request.temperature is not None else 0.70)
    spd = float(request.speed if request.speed is not None else 1.0)
    rep = float(request.repetition_penalty if request.repetition_penalty is not None else 4.0)
    tk = int(request.top_k if request.top_k is not None else 50)
    tp = float(request.top_p if request.top_p is not None else 0.85)

    cache_key = _get_cache_key(
        request.voice_id,
        request.language,
        clean_text,
        max_seconds,
        temperature=temp,
        speed=spd,
        repetition_penalty=rep,
        top_k=tk,
        top_p=tp,
    )

    if not request.no_cache:
        cached = _get_cached_synthesis(cache_key)
        if cached:
            cached["latency_ms"] = int((time.time() - start_time) * 1000)
            cached["cached"] = True
            logger.info(f"TTS cache hit for voice '{request.voice_id}' ({cached['latency_ms']}ms)")
            return SynthesizeResponse(**cached)

    # 4. Get model
    try:
        model = await _get_model()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Modelo TTS não disponível no momento: {str(e)}",
        )

    # 5. Synthesize under concurrency semaphore
    output_path = SPEAKERS_DIR / f"synth_{uuid.uuid4().hex[:8]}.wav"

    async with _synthesis_semaphore:
        try:
            def run_tts():
                extra_kwargs = {
                    "split_sentences": bool(request.enable_text_splitting if request.enable_text_splitting is not None else True),
                }
                if request.speed is not None:
                    extra_kwargs["speed"] = float(request.speed)
                if request.temperature is not None:
                    extra_kwargs["temperature"] = float(request.temperature)
                if request.repetition_penalty is not None:
                    extra_kwargs["repetition_penalty"] = float(request.repetition_penalty)
                if request.length_penalty is not None:
                    extra_kwargs["length_penalty"] = float(request.length_penalty)
                if request.top_k is not None:
                    extra_kwargs["top_k"] = int(request.top_k)
                if request.top_p is not None:
                    extra_kwargs["top_p"] = float(request.top_p)

                model.tts_to_file(
                    text=clean_text,
                    speaker_wav=speaker_wav_path,
                    language=request.language,
                    file_path=str(output_path),
                    **extra_kwargs,
                )

            await asyncio.to_thread(run_tts)

            # Master Post-Processing (Peak Normalization & Dead Silence Trimming)
            _post_process_audio(output_path)

            # 6. Clip audio to maxAudioSeconds if configured
            if max_seconds > 0:
                _trim_audio_to_max_duration(output_path, max_seconds)

            # Read duration and bytes
            duration = _get_audio_duration_seconds(output_path)
            audio_bytes = output_path.read_bytes()
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

        except Exception as e:
            logger.error(f"Erro na síntese TTS: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Falha na síntese de voz: {str(e)}",
            )
        finally:
            output_path.unlink(missing_ok=True)

    elapsed_ms = int((time.time() - start_time) * 1000)

    response_data = {
        "audio_base64": audio_base64,
        "format": "wav",
        "sample_rate": 22050,
        "latency_ms": elapsed_ms,
        "text_length": len(request.text),
        "voice_id": request.voice_id,
        "duration_seconds": round(duration, 2),
        "cached": False,
    }

    # 7. Store in cache for instant future responses
    _set_cached_synthesis(cache_key, response_data)

    return SynthesizeResponse(**response_data)


@tts_router.post("/synthesize/audio")
async def synthesize_speech_audio(request: SynthesizeRequest):
    """
    Synthesize speech and stream raw WAV audio (checks cache first).
    """
    speaker_wav_path = resolve_voice(request.voice_id, tenant_id=request.tenant_id)

    clean_text = _sanitize_text_for_tts(request.text)
    max_seconds = request.max_audio_seconds or 0.0
    if max_seconds > 0:
        clean_text = _truncate_text_for_duration(clean_text, max_seconds)

    # Check cache
    temp = float(request.temperature if request.temperature is not None else 0.70)
    spd = float(request.speed if request.speed is not None else 1.0)
    rep = float(request.repetition_penalty if request.repetition_penalty is not None else 4.0)
    tk = int(request.top_k if request.top_k is not None else 50)
    tp = float(request.top_p if request.top_p is not None else 0.85)

    cache_key = _get_cache_key(
        request.voice_id,
        request.language,
        clean_text,
        max_seconds,
        temperature=temp,
        speed=spd,
        repetition_penalty=rep,
        top_k=tk,
        top_p=tp,
    )
    if not request.no_cache:
        cached = _get_cached_synthesis(cache_key)
        if cached and "audio_base64" in cached:
            raw_bytes = base64.b64decode(cached["audio_base64"])
            return StreamingResponse(
                io.BytesIO(raw_bytes),
                media_type="audio/wav",
                headers={"Content-Disposition": f"inline; filename=bipesend_tts_{request.voice_id}.wav"},
            )

    try:
        model = await _get_model()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"TTS model not available: {str(e)}")

    output_path = SPEAKERS_DIR / f"synth_{uuid.uuid4().hex[:8]}.wav"

    async with _synthesis_semaphore:
        try:
            def run_tts():
                extra_kwargs = {
                    "split_sentences": bool(request.enable_text_splitting if request.enable_text_splitting is not None else True),
                }
                if request.speed is not None:
                    extra_kwargs["speed"] = float(request.speed)
                if request.temperature is not None:
                    extra_kwargs["temperature"] = float(request.temperature)
                if request.repetition_penalty is not None:
                    extra_kwargs["repetition_penalty"] = float(request.repetition_penalty)
                if request.length_penalty is not None:
                    extra_kwargs["length_penalty"] = float(request.length_penalty)
                if request.top_k is not None:
                    extra_kwargs["top_k"] = int(request.top_k)
                if request.top_p is not None:
                    extra_kwargs["top_p"] = float(request.top_p)

                model.tts_to_file(
                    text=clean_text,
                    speaker_wav=speaker_wav_path,
                    language=request.language,
                    file_path=str(output_path),
                    **extra_kwargs,
                )

            await asyncio.to_thread(run_tts)

            if max_seconds > 0:
                _trim_audio_to_max_duration(output_path, max_seconds)

            duration = _get_audio_duration_seconds(output_path)
            audio_bytes = output_path.read_bytes()
            output_path.unlink(missing_ok=True)

            # Store in cache
            _set_cached_synthesis(cache_key, {
                "audio_base64": base64.b64encode(audio_bytes).decode("utf-8"),
                "format": "wav",
                "sample_rate": 22050,
                "latency_ms": 100,
                "text_length": len(request.text),
                "voice_id": request.voice_id,
                "duration_seconds": round(duration, 2),
                "cached": False,
            })

            return StreamingResponse(
                io.BytesIO(audio_bytes),
                media_type="audio/wav",
                headers={
                    "Content-Disposition": f"inline; filename=bipesend_tts_{request.voice_id}.wav",
                },
            )

        except Exception as e:
            output_path.unlink(missing_ok=True)
            raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")


# ─── Fila Assíncrona Redis (Evita travamentos em sínteses pesadas) ────────────


@tts_router.post("/synthesize/async", response_model=AsyncSynthesizeResponse)
async def enqueue_synthesize_speech(request: SynthesizeRequest):
    """
    Enfileira síntese de voz pesada no Redis para processamento em background,
    evitando bloqueio do event loop e timeouts HTTP.
    Se já estiver em cache, retorna concluído imediatamente.
    """
    clean_text = _sanitize_text_for_tts(request.text)
    max_seconds = request.max_audio_seconds or 0.0

    # 1. Se estiver em cache, retorno imediato
    cache_key = _get_cache_key(request.voice_id, request.language, clean_text, max_seconds)
    cached = _get_cached_synthesis(cache_key)
    if cached:
        cached["cached"] = True
        return AsyncSynthesizeResponse(
            job_id="cached",
            status="completed",
            voice_id=request.voice_id,
            message="Resposta obtida instantaneamente do cache de alta velocidade.",
            cached=True,
            result=SynthesizeResponse(**cached),
        )

    # 2. Gera Job ID
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    job_data = {
        "job_id": job_id,
        "status": "queued",
        "progress": 0,
        "voice_id": request.voice_id,
        "request": request.model_dump(),
        "created_at": now_str,
    }

    # Salva no Redis ou na memória
    r = _get_redis()
    if r:
        try:
            r.setex(f"tts:job:{job_id}", 7200, json.dumps(job_data))
            r.rpush("tts:queue:jobs", json.dumps(job_data))
        except Exception as e:
            logger.warning(f"Erro ao enfileirar no Redis: {e}")
            _async_jobs[job_id] = job_data
    else:
        _async_jobs[job_id] = job_data

    # Dispara processamento em background seguro
    asyncio.create_task(_process_async_tts_job(job_id, request))

    return AsyncSynthesizeResponse(
        job_id=job_id,
        status="queued",
        voice_id=request.voice_id,
        message="Síntese enfileirada com sucesso no motor Redis.",
        cached=False,
    )


async def _process_async_tts_job(job_id: str, request: SynthesizeRequest):
    """Worker interno que processa jobs assíncronos da fila."""
    try:
        # Atualiza status para processing
        _update_job_status(job_id, status="processing", progress=20)

        # Executa síntese com semáforo
        result = await synthesize_speech(request)

        _update_job_status(
            job_id,
            status="completed",
            progress=100,
            result=result.model_dump(),
        )
    except Exception as e:
        logger.error(f"Erro ao processar job assíncrono {job_id}: {e}")
        _update_job_status(job_id, status="failed", progress=0, error=str(e))


def _update_job_status(job_id: str, **kwargs):
    r = _get_redis()
    if r:
        try:
            existing = r.get(f"tts:job:{job_id}")
            data = json.loads(existing) if existing else {"job_id": job_id}
            data.update(kwargs)
            r.setex(f"tts:job:{job_id}", 7200, json.dumps(data))
            return
        except Exception:
            pass
    if job_id in _async_jobs:
        _async_jobs[job_id].update(kwargs)


@tts_router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Consulta o status e o resultado de um job assíncrono de síntese na fila."""
    r = _get_redis()
    data = None
    if r:
        try:
            raw = r.get(f"tts:job:{job_id}")
            if raw:
                data = json.loads(raw)
        except Exception:
            pass

    if not data:
        data = _async_jobs.get(job_id)

    if not data:
        raise HTTPException(status_code=404, detail="Job de síntese não encontrado ou expirado.")

    result_obj = SynthesizeResponse(**data["result"]) if data.get("result") else None

    return JobStatusResponse(
        job_id=job_id,
        status=data.get("status", "queued"),
        progress=data.get("progress", 0),
        voice_id=data.get("voice_id", ""),
        result=result_obj,
        error=data.get("error"),
        created_at=data.get("created_at", ""),
    )


@tts_router.delete("/voices/{voice_id}")
async def delete_voice(voice_id: str, tenant_id: Optional[str] = Query(None, description="Tenant ID para verificação de permissão")):
    """Delete a cloned voice with tenant ownership verification. Built-in voices cannot be deleted."""
    voices = get_all_voices()

    if voice_id not in voices:
        raise HTTPException(status_code=404, detail=f"Voz '{voice_id}' não encontrada.")

    voice = voices[voice_id]
    if voice.get("type") == "builtin":
        raise HTTPException(status_code=403, detail="Vozes do sistema não podem ser excluídas.")

    # Verificação de segurança multi-tenant
    if voice.get("type") == "cloned" and tenant_id:
        voice_tenant = voice.get("tenant_id")
        if voice_tenant and voice_tenant != tenant_id:
            raise HTTPException(
                status_code=403,
                detail="Acesso negado: você não tem permissão para excluir voz pertencente a outro tenant.",
            )

    # Delete metadata
    meta_path = SPEAKERS_DIR / f"{voice_id}.json"
    meta_path.unlink(missing_ok=True)

    # Delete audio files
    for pattern in [f"{voice_id}.*", f"{voice_id}_raw.*"]:
        for f in SPEAKERS_DIR.glob(pattern):
            f.unlink(missing_ok=True)

    return {"status": "deleted", "voice_id": voice_id}


@tts_router.get("/health")
async def tts_health():
    """Check TTS service health, Redis cache connection, and model status."""
    global _tts_model
    voices = get_all_voices()
    r = _get_redis()
    return {
        "status": "healthy",
        "model_loaded": _tts_model is not None,
        "device": _tts_device or "not initialized",
        "redis_connected": r is not None,
        "cache_enabled": settings.TTS_CACHE_ENABLED,
        "voices_available": len(voices),
        "builtin_voices": [v["id"] for v in voices.values() if v.get("type") == "builtin"],
        "cloned_voices": [v["id"] for v in voices.values() if v.get("type") == "cloned"],
        "ffmpeg_available": _has_ffmpeg(),
        "r2_storage_enabled": voice_storage.is_r2_enabled,
    }
