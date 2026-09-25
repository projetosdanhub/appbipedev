"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Download,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Activity,
  AudioWaveform,
  Clock,
  Radio,
  FileAudio,
  Copy,
  Check,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  VolumeX,
  SlidersHorizontal,
  Server,
  AlertCircle,
} from "lucide-react";
import {
  synthesizeSpeechAction,
  checkAiServiceHealthAction,
  SynthesizeOptions,
} from "../actions/superadmin-ai.actions";
import {
  GERMANI_ACOUSTIC_MANIFEST,
  GERMANI_TEST_PHRASES,
  GERMANI_CALIBRATION_PRESETS,
  VoiceCalibrationPreset,
  VoiceProfileService,
} from "../services/voice-profile.service";

interface VoiceStudioResult {
  audioBase64: string;
  latencyMs: number;
  durationSeconds: number;
  sampleRate: number;
  format: string;
  text: string;
  timestamp: string;
}

export function GermaniVoiceStudio() {
  // Estado do Motor Neural Python
  const [isEngineOnline, setIsEngineOnline] = useState<boolean | null>(null);

  // Preset Ativo de Calibração (Padrão: OpenAI Natural)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("openai_natural");

  // Parâmetros Nativos XTTS v2 (Iniciados com o Preset Padrão OpenAI)
  const [temperature, setTemperature] = useState(0.68);
  const [speed, setSpeed] = useState(1.02);
  const [repetitionPenalty, setRepetitionPenalty] = useState(4.0);
  const [topK, setTopK] = useState(50);
  const [topP, setTopP] = useState(0.85);

  // Texto para Síntese
  const [textToSynthesize, setTextToSynthesize] = useState(GERMANI_TEST_PHRASES[0]);

  // Estado da Síntese & Cronômetro em Milissegundos
  const [isGenerating, setIsGenerating] = useState(false);
  const [realtimeElapsedMs, setRealtimeElapsedMs] = useState(0);
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const [synthesisStage, setSynthesisStage] = useState("");
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Resultado da Última Síntese
  const [lastResult, setLastResult] = useState<VoiceStudioResult | null>(null);

  // Players de Áudio
  const [isPlayingGenerated, setIsPlayingGenerated] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [generatedProgress, setGeneratedProgress] = useState(0);
  const [referenceProgress, setReferenceProgress] = useState(0);
  const [activePlaybackTime, setActivePlaybackTime] = useState(0);

  const generatedAudioRef = useRef<HTMLAudioElement | null>(null);
  const referenceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Toggle do Manifesto Técnico JSON
  const [showManifestInspector, setShowManifestInspector] = useState(false);
  const [hasCopiedManifest, setHasCopiedManifest] = useState(false);

  // Checagem de conectividade do motor neural Python XTTS na montagem
  useEffect(() => {
    checkAiServiceHealthAction()
      .then((h) => setIsEngineOnline(h.online))
      .catch(() => setIsEngineOnline(false));
  }, []);

  // Limpeza de timers ao desmontar
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (generatedAudioRef.current) generatedAudioRef.current.pause();
      if (referenceAudioRef.current) referenceAudioRef.current.pause();
    };
  }, []);

  // Aplicar Preset Homologado de Calibração
  const handleApplyPreset = (preset: VoiceCalibrationPreset) => {
    setSelectedPresetId(preset.id);
    setTemperature(preset.temperature);
    setSpeed(preset.speed);
    setRepetitionPenalty(preset.repetitionPenalty);
    setTopK(preset.topK);
    setTopP(preset.topP);
    toast.success(`Preset "${preset.name}" calibrado com sucesso!`);
  };

  // Resetar parâmetros para baseline oficial (OpenAI Natural)
  const handleResetToBaseline = () => {
    const defaultPreset = GERMANI_CALIBRATION_PRESETS[0];
    handleApplyPreset(defaultPreset);
  };

  // Formatação de tempo em minutos:segundos (ex: 0:05)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Gerar Voz com XTTS v2
  const handleGenerateVoice = async () => {
    if (!textToSynthesize.trim()) {
      toast.warning("Digite um texto para sintetizar a voz da Germani.");
      return;
    }

    // Parar reproduções ativas
    if (generatedAudioRef.current) {
      generatedAudioRef.current.pause();
      setIsPlayingGenerated(false);
    }
    if (referenceAudioRef.current) {
      referenceAudioRef.current.pause();
      setIsPlayingReference(false);
    }

    setIsGenerating(true);
    setRealtimeElapsedMs(0);
    setSynthesisProgress(5);
    setSynthesisStage("Normalizando texto e tokenizando fonemas em português...");
    const startTime = performance.now();

    // Cronômetro em milissegundos em tempo real na tela
    timerIntervalRef.current = setInterval(() => {
      setRealtimeElapsedMs(Math.round(performance.now() - startTime));
    }, 20);

    // Progresso dinâmico com estágios cognitivos do XTTS v2
    progressIntervalRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      let p = 5;
      let stage = "Preparando léxico fonético e tokenização...";
      if (elapsed < 3) {
        p = Math.min(18, 5 + Math.round((elapsed / 3) * 13));
        stage = "Normalizando texto e tokenizando fonemas em português...";
      } else if (elapsed < 12) {
        p = Math.min(42, 18 + Math.round(((elapsed - 3) / 9) * 24));
        stage = "Extraindo vetores latentes acústicos de germani.wav...";
      } else if (elapsed < 28) {
        p = Math.min(75, 42 + Math.round(((elapsed - 12) / 16) * 33));
        stage = "Inferência autoregressiva neural (XTTS v2 GPT Latent Decoder)...";
      } else if (elapsed < 42) {
        p = Math.min(94, 75 + Math.round(((elapsed - 28) / 14) * 19));
        stage = "Decodificação HiFi-GAN Vocoder (Síntese PCM 24.000 Hz)...";
      } else {
        p = Math.min(98, 94 + Math.round(((elapsed - 42) / 20) * 4));
        stage = "Equalização espectral e empacotamento do áudio WAV...";
      }
      setSynthesisProgress(p);
      setSynthesisStage(stage);
    }, 150);

    try {
      const options: SynthesizeOptions = {
        temperature,
        speed,
        repetition_penalty: repetitionPenalty,
        top_k: topK,
        top_p: topP,
        no_cache: true,
      };

      const res = await synthesizeSpeechAction(textToSynthesize, "germani", options);
      const totalElapsedMs = Math.round(performance.now() - startTime);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setRealtimeElapsedMs(res.latency_ms || totalElapsedMs);

      if (res.success && res.audio_base64) {
        setSynthesisProgress(100);
        setSynthesisStage("Voz clonada da Germani gerada com sucesso!");

        const result: VoiceStudioResult = {
          audioBase64: res.audio_base64,
          latencyMs: res.latency_ms || totalElapsedMs,
          durationSeconds: res.duration_seconds || 5.0,
          sampleRate: res.sample_rate || 22050,
          format: res.format || "wav",
          text: textToSynthesize,
          timestamp: new Date().toLocaleTimeString("pt-BR"),
        };
        setLastResult(result);
        setGeneratedProgress(0);
        setActivePlaybackTime(0);

        toast.success(`Voz da Germani clonada com sucesso em ${(result.latencyMs / 1000).toFixed(1)}s!`);

        // Inicializar e reproduzir áudio gerado
        const audioSrc = `data:audio/wav;base64,${res.audio_base64}`;
        if (!generatedAudioRef.current) {
          generatedAudioRef.current = new Audio(audioSrc);
        } else {
          generatedAudioRef.current.src = audioSrc;
        }

        generatedAudioRef.current.onended = () => {
          setIsPlayingGenerated(false);
          setGeneratedProgress(0);
          setActivePlaybackTime(0);
        };

        generatedAudioRef.current.ontimeupdate = () => {
          if (generatedAudioRef.current && generatedAudioRef.current.duration) {
            const current = generatedAudioRef.current.currentTime;
            const dur = generatedAudioRef.current.duration;
            setGeneratedProgress((current / dur) * 100);
            setActivePlaybackTime(current);
          }
        };

        try {
          await generatedAudioRef.current.play();
          setIsPlayingGenerated(true);
        } catch {
          // Autoplay pode ser prevenido pelas políticas do navegador; usuário clica play livremente
        }
      } else {
        setSynthesisProgress(0);
        setSynthesisStage("");
        toast.error(res.error || "Erro ao sintetizar voz com XTTS v2.");
      }
    } catch {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setSynthesisProgress(0);
      setSynthesisStage("");
      toast.error("Erro inesperado durante a síntese de voz.");
    } finally {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsGenerating(false);
    }
  };

  // Play / Pause do Áudio Gerado
  const togglePlayGenerated = () => {
    if (!lastResult) return;

    if (!generatedAudioRef.current) {
      generatedAudioRef.current = new Audio(`data:audio/wav;base64,${lastResult.audioBase64}`);
      generatedAudioRef.current.onended = () => {
        setIsPlayingGenerated(false);
        setGeneratedProgress(0);
        setActivePlaybackTime(0);
      };
      generatedAudioRef.current.ontimeupdate = () => {
        if (generatedAudioRef.current && generatedAudioRef.current.duration) {
          const current = generatedAudioRef.current.currentTime;
          const dur = generatedAudioRef.current.duration;
          setGeneratedProgress((current / dur) * 100);
          setActivePlaybackTime(current);
        }
      };
    }

    if (isPlayingGenerated) {
      generatedAudioRef.current.pause();
      setIsPlayingGenerated(false);
    } else {
      if (referenceAudioRef.current) {
        referenceAudioRef.current.pause();
        setIsPlayingReference(false);
      }
      generatedAudioRef.current.play().then(() => setIsPlayingGenerated(true)).catch(() => {});
    }
  };

  // Seek na Timeline do Áudio Gerado
  const handleSeekGenerated = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!generatedAudioRef.current || !generatedAudioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * generatedAudioRef.current.duration;
    generatedAudioRef.current.currentTime = newTime;
    setActivePlaybackTime(newTime);
    setGeneratedProgress(pct * 100);
  };

  // Play / Pause do Áudio de Referência Original (germani.wav)
  const togglePlayReference = () => {
    if (!referenceAudioRef.current) {
      referenceAudioRef.current = new Audio("/assets/germani.wav");
      referenceAudioRef.current.onended = () => {
        setIsPlayingReference(false);
        setReferenceProgress(0);
      };
      referenceAudioRef.current.ontimeupdate = () => {
        if (referenceAudioRef.current && referenceAudioRef.current.duration) {
          const current = referenceAudioRef.current.currentTime;
          const dur = referenceAudioRef.current.duration;
          setReferenceProgress((current / dur) * 100);
        }
      };
    }

    if (isPlayingReference) {
      referenceAudioRef.current.pause();
      setIsPlayingReference(false);
    } else {
      if (generatedAudioRef.current) {
        generatedAudioRef.current.pause();
        setIsPlayingGenerated(false);
      }
      referenceAudioRef.current.play().then(() => setIsPlayingReference(true)).catch(() => {});
    }
  };

  // Baixar WAV Gerado
  const handleDownloadWav = () => {
    if (!lastResult) return;
    const link = document.createElement("a");
    link.href = `data:audio/wav;base64,${lastResult.audioBase64}`;
    link.download = `germani-voz-xtts-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download do áudio WAV iniciado!");
  };

  // Copiar Manifesto JSON
  const handleCopyManifest = () => {
    const jsonStr = JSON.stringify(GERMANI_ACOUSTIC_MANIFEST, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setHasCopiedManifest(true);
    toast.success("Manifesto acústico copiado para a área de transferência!");
    setTimeout(() => setHasCopiedManifest(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── STATUS DO MOTOR NEURAL PYTHON XTTS v2 ── */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          isEngineOnline === true
            ? "bg-emerald-50/80 border-emerald-200/90 text-emerald-900 shadow-2xs"
            : isEngineOnline === false
            ? "bg-rose-50/80 border-rose-200/90 text-rose-900 shadow-2xs"
            : "bg-slate-50 border-slate-200 text-slate-700 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full shrink-0 ${
              isEngineOnline === true
                ? "bg-emerald-500 animate-pulse"
                : isEngineOnline === false
                ? "bg-rose-500"
                : "bg-amber-400 animate-spin"
            }`}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs">
                {isEngineOnline === true
                  ? "Motor Neural Coqui XTTS v2 Conectado & Ativo (Porta 5005)"
                  : isEngineOnline === false
                  ? "Motor Neural Offline — Serviço Python não detectado na porta 5005"
                  : "Verificando conectividade do Motor Neural..."}
              </span>
              {isEngineOnline === true && (
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  PyTorch CPU • XTTS v2 1.86 GB Carregado em Memória
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isEngineOnline === true
                ? "Microserviço FastAPI pronto para síntese neural em tempo real com clonagem acústica de germani.wav."
                : isEngineOnline === false
                ? "Inicie o serviço com: uvicorn app.main:app --port 5005 no diretório services/ai-service"
                : "Consultando endpoint /health do microserviço de inteligência artificial..."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            const h = await checkAiServiceHealthAction();
            setIsEngineOnline(h.online);
            if (h.online) {
              toast.success("Motor Neural Python XTTS v2 está ativo e pronto!");
            } else {
              toast.error("Motor Neural Python está inacessível na porta 5005.");
            }
          }}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white transition-colors cursor-pointer shrink-0 self-start sm:self-auto bg-white/80 shadow-2xs"
        >
          Verificar Conexão
        </button>
      </div>

      {/* ── CARD PRINCIPAL: PERFIL ACÚSTICO OFICIAL & REFERÊNCIA ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <h3 className="font-inter text-lg font-bold text-slate-900">
                  Germani — Voz Oficial Soberana
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  XTTS v2 Homologado
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#007BFF] border border-blue-200">
                  Pitch: 176.1 Hz
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Saída: 24.000 Hz
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Identidade vocal soberana da Germani baseada nas medições acústicas reais de{" "}
                <code className="text-[11px] font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                  germani.wav
                </code>
                . Voz feminina brasileira acolhedora, serena, clara e inteligente com condicionamento de estilo e timbre.
              </p>
            </div>
          </div>

          {/* Player do Áudio de Referência Original */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl shrink-0">
            <button
              type="button"
              onClick={togglePlayReference}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isPlayingReference
                  ? "bg-amber-500 text-white"
                  : "bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white hover:opacity-95"
              }`}
              title={isPlayingReference ? "Pausar referência" : "Ouvir áudio de referência oficial (germani.wav)"}
            >
              {isPlayingReference ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 block">
                {isPlayingReference ? "Reproduzindo Referência..." : "Referência Oficial"}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>germani.wav (15.6s)</span>
                <span>•</span>
                <span className="font-mono text-emerald-600 font-semibold">-18.1 LUFS</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Indicadores Instrumentais Medidos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Pitch Central (F0)
            </span>
            <strong className="text-sm text-slate-900 font-inter block mt-0.5">176.1 Hz</strong>
            <span className="text-[10px] text-blue-600 font-medium">Faixa 133–222 Hz</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Loudness Integrada
            </span>
            <strong className="text-sm text-slate-900 font-inter block mt-0.5">-18.1 LUFS</strong>
            <span className="text-[10px] text-emerald-600 font-medium">Peak: -3.3 dBTP</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Periodicidade (HNR)
            </span>
            <strong className="text-sm text-slate-900 font-inter block mt-0.5">9.8 dB</strong>
            <span className="text-[10px] text-slate-500 font-medium">Fonação Regular</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Centroide Espectral
            </span>
            <strong className="text-sm text-slate-900 font-inter block mt-0.5">295.7 Hz</strong>
            <span className="text-[10px] text-purple-600 font-medium">Energia &lt; 1 kHz</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Taxa de Saída
            </span>
            <strong className="text-sm text-slate-900 font-inter block mt-0.5">24.000 Hz</strong>
            <span className="text-[10px] text-slate-500 font-medium">Mono PCM 16-bit</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Integridade do Sinal
            </span>
            <strong className="text-sm text-emerald-700 font-inter block mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" /> Sem Clipping
            </strong>
            <span className="text-[10px] text-slate-500 font-medium">Pico Seguro</span>
          </div>
        </div>
      </div>

      {/* ── ÁREA DE TRABALHO: AJUSTE FINO & REDAÇÃO DE TEXTO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: PARÂMETROS NATIVOS XTTS v2 (5 colunas) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#007BFF]" />
                <h4 className="font-inter text-sm font-bold text-slate-900">
                  Calibração Nativa do XTTS v2
                </h4>
              </div>
              <button
                type="button"
                onClick={handleResetToBaseline}
                className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Restaurar valores baseline recomendados pelo manifesto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Baseline</span>
              </button>
            </div>

            {/* Seletor de Presets Homologados de Calibração */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#007BFF]" />
                  <span>Presets Homologados BipeSend</span>
                </span>
                {selectedPresetId ? (
                  <span className="text-[10px] font-semibold text-[#007BFF] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Ativo: {GERMANI_CALIBRATION_PRESETS.find((p) => p.id === selectedPresetId)?.name.split(" ")[0]}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Ajuste Fino Manual
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GERMANI_CALIBRATION_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "bg-blue-50/90 border-[#007BFF] ring-2 ring-[#007BFF]/20 shadow-xs"
                          : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-bold text-xs text-slate-900 leading-tight">
                          {preset.name}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${preset.badgeColor}`}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-200/50 text-[10px] font-mono text-slate-600">
                        <span>T: {preset.temperature}</span>
                        <span>•</span>
                        <span>V: {preset.speed}x</span>
                        <span>•</span>
                        <span>Rep: {preset.repetitionPenalty}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-3 border-t border-slate-100">
              {/* Temperatura */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Temperatura de Amostragem</span>
                    <span className="text-[10.5px] text-slate-400 font-normal">(Variabilidade)</span>
                  </label>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                    {temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => {
                    setTemperature(parseFloat(e.target.value));
                    setSelectedPresetId(null);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007BFF]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0.10 (Mais estável)</span>
                  <span>0.68 (OpenAI Natural)</span>
                  <span>1.00 (Mais dinâmico)</span>
                </div>
              </div>

              {/* Velocidade / Speed */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Velocidade de Fala</span>
                    <span className="text-[10.5px] text-slate-400 font-normal">(Cadência)</span>
                  </label>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                    {speed.toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="1.50"
                  step="0.05"
                  value={speed}
                  onChange={(e) => {
                    setSpeed(parseFloat(e.target.value));
                    setSelectedPresetId(null);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007BFF]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0.70x (Calmo)</span>
                  <span>1.02x (Natural OpenAI)</span>
                  <span>1.50x (Ágil)</span>
                </div>
              </div>

              {/* Penalidade de Repetição */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Penalidade de Repetição</span>
                    <span className="text-[10.5px] text-slate-400 font-normal">(Estabilidade)</span>
                  </label>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                    {repetitionPenalty.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.5"
                  value={repetitionPenalty}
                  onChange={(e) => {
                    setRepetitionPenalty(parseFloat(e.target.value));
                    setSelectedPresetId(null);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007BFF]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>1.0 (Livre)</span>
                  <span>4.0 (Anti-Gagueira)</span>
                  <span>10.0 (Rigoroso)</span>
                </div>
              </div>

              {/* Top-K e Top-P */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-semibold text-slate-700">Top-K</label>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{topK}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={topK}
                    onChange={(e) => {
                      setTopK(parseInt(e.target.value, 10));
                      setSelectedPresetId(null);
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007BFF]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-semibold text-slate-700">Top-P</label>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{topP.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="1.00"
                    step="0.05"
                    value={topP}
                    onChange={(e) => {
                      setTopP(parseFloat(e.target.value));
                      setSelectedPresetId(null);
                    }}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007BFF]"
                  />
                </div>
              </div>
            </div>

            {/* Aviso Técnico do Manifesto */}
            <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-blue-900 block mb-0.5">Controles 100% Nativos do XTTS v2</strong>
              Não são aplicados filtros artificiais nem parâmetros inexistentes. A identidade vocal é extraída diretamente dos tensores latentes de <span className="font-mono text-blue-700">germani.wav</span>.
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: REDAÇÃO, FRASES DE TESTE & GERAÇÃO (7 colunas) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#007BFF]" />
                  <h4 className="font-inter text-sm font-bold text-slate-900">
                    Texto para Síntese Vocal
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span>{textToSynthesize.length} caracteres</span>
                  <span>•</span>
                  <span>{textToSynthesize.trim().split(/\s+/).filter(Boolean).length} palavras</span>
                </div>
              </div>

              {/* Frases Rápidas de Homologação */}
              <div className="mb-3">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Frases Oficiais de Homologação do Manifesto:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {GERMANI_TEST_PHRASES.map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTextToSynthesize(phrase)}
                      className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        textToSynthesize === phrase
                          ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      Frase {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={textToSynthesize}
                  onChange={(e) => setTextToSynthesize(e.target.value)}
                  placeholder="Escreva qualquer frase para ouvir a Germani falar..."
                  rows={4}
                  className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/15 outline-none text-slate-800 bg-slate-50/50 resize-y leading-relaxed transition-all"
                />
              </div>

              {/* Normalização Fonética Rápida */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const norm = VoiceProfileService.normalizeTextForSpeech(textToSynthesize);
                    setTextToSynthesize(norm);
                    toast.success("Texto normalizado com o léxico fonético BipeSend!");
                  }}
                  className="text-xs font-semibold text-[#007BFF] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Aplica conversões de moedas (R$), siglas (PIX, API, CRM) e termos da marca"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Aplicar Normalização Fonética BipeSend</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTextToSynthesize("")}
                  className="text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* BOTÃO ANIMADO DE GERAÇÃO COM ONDAS SONORAS & CRONÔMETRO MS */}
            <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <span className="font-semibold text-slate-700">
                      Sintetizando áudio em tempo real:
                    </span>
                    <strong className="font-mono text-blue-700 font-bold text-sm">
                      {realtimeElapsedMs} ms
                    </strong>
                  </div>
                ) : lastResult ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Última síntese gerada em</span>
                    <strong className="font-mono font-bold text-slate-900">{lastResult.latencyMs} ms</strong>
                  </div>
                ) : (
                  <span>Pronto para sintetizar a voz com XTTS v2</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateVoice}
                disabled={isGenerating || !textToSynthesize.trim()}
                className={`relative px-5 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer overflow-hidden ${
                  isGenerating
                    ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/25 cursor-wait"
                    : "bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-blue-600 hover:to-indigo-600 shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
                }`}
              >
                {isGenerating ? (
                  <>
                    {/* Ondas Sonoras Animadas Pulsando */}
                    <div className="flex items-center gap-0.5 h-4">
                      <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                      <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                      <span className="w-1 bg-white rounded-full animate-bounce h-2" />
                      <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.25s] h-4" />
                      <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.1s] h-3" />
                    </div>
                    <span>Sintetizando com XTTS v2 ({realtimeElapsedMs} ms)...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Sintetizar & Ouvir Voz da Germani</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD DE PROGRESSO DA SÍNTESE NEURAL EM TEMPO REAL ── */}
      {isGenerating && (
        <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-purple-50/60 border-2 border-blue-300/80 rounded-2xl p-5 sm:p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold shadow-xs shrink-0 animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-inter text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Clonando & Sintetizando Voz da Germani</span>
                  <span className="font-mono text-xs text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full font-bold">
                    XTTS v2 Neural
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {synthesisStage || "Processando tensores neurais..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Tempo Decorrido</span>
                <span className="font-mono text-sm font-bold text-blue-700">
                  {(realtimeElapsedMs / 1000).toFixed(1)}s{" "}
                  <span className="text-[11px] text-slate-400 font-normal">({realtimeElapsedMs} ms)</span>
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white border border-blue-200 shadow-xs flex flex-col items-center justify-center shrink-0">
                <span className="font-inter text-base font-extrabold text-[#007BFF] leading-none">
                  {synthesisProgress}%
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Status</span>
              </div>
            </div>
          </div>

          {/* Barra de Progresso com Gradiente Animado */}
          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5 relative shadow-inner mb-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#007BFF] via-[#6366F1] to-purple-600 transition-all duration-300 ease-out relative"
              style={{ width: `${Math.max(4, Math.min(100, synthesisProgress))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] bg-[length:200%_100%]" />
            </div>
          </div>

          {/* 5 Etapas do Pipeline Cognitivo */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div
              className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                synthesisProgress >= 15
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white/80 border-slate-200 text-slate-500"
              }`}
            >
              1. Tokenização
            </div>
            <div
              className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                synthesisProgress >= 40
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white/80 border-slate-200 text-slate-500"
              }`}
            >
              2. Latentes Acústicos
            </div>
            <div
              className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                synthesisProgress >= 75
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white/80 border-slate-200 text-slate-500"
              }`}
            >
              3. GPT Autoregressivo
            </div>
            <div
              className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                synthesisProgress >= 92
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white/80 border-slate-200 text-slate-500"
              }`}
            >
              4. HiFi-GAN Vocoder
            </div>
            <div
              className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                synthesisProgress >= 100
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white/80 border-slate-200 text-slate-500"
              }`}
            >
              5. Áudio WAV 24kHz
            </div>
          </div>
        </div>
      )}

      {/* ── PAINEL DE RESULTADO: PLAYER INTERATIVO DA VOZ CLONADA DA GERMANI ── */}
      {lastResult && (
        <div className="bg-white border-2 border-emerald-300/80 rounded-2xl p-5 sm:p-6 shadow-md animate-in fade-in slide-in-from-top-3 duration-300 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-inter text-base font-bold text-slate-900">
                  Voz Clonada Oficial da Germani (Áudio Novo Sintetizado)
                </h4>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  XTTS v2 • {lastResult.sampleRate} Hz
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#007BFF] border border-blue-200">
                  {lastResult.durationSeconds.toFixed(1)}s de áudio
                </span>
              </div>
              <p className="text-xs text-slate-700 italic bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 mt-2">
                &ldquo;{lastResult.text}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleDownloadWav}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Baixar arquivo WAV gerado no estúdio"
              >
                <Download className="w-3.5 h-3.5 text-[#007BFF]" />
                <span>Baixar WAV</span>
              </button>

              <button
                type="button"
                onClick={togglePlayReference}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                  isPlayingReference
                    ? "bg-amber-500 text-white border-amber-600"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
                title="Comparar com áudio original de referência"
              >
                <Radio className="w-3.5 h-3.5 text-[#007BFF]" />
                <span>{isPlayingReference ? "Pausar Original" : "Comparar c/ Original (germani.wav)"}</span>
              </button>
            </div>
          </div>

          {/* Player com Timeline Clicável e Visualizador de Onda Sonora */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Botão Play / Pause da Voz Clonada */}
              <div className="flex items-center gap-3.5 shrink-0">
                <button
                  type="button"
                  onClick={togglePlayGenerated}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isPlayingGenerated
                      ? "bg-amber-500 text-white shadow-amber-500/25 hover:bg-amber-600"
                      : "bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white shadow-blue-500/25 hover:opacity-95 active:scale-95"
                  }`}
                  title={isPlayingGenerated ? "Pausar áudio gerado" : "Dar Play na voz clonada da Germani"}
                >
                  {isPlayingGenerated ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {isPlayingGenerated ? "Reproduzindo Voz Clonada..." : "Ouvir Voz Clonada da Germani"}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-600 mt-0.5">
                    <span className="font-bold text-blue-700">{formatTime(activePlaybackTime)}</span>
                    <span>/</span>
                    <span>{formatTime(lastResult.durationSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Visualizador de Onda Sonora Interativo */}
              <div className="flex-1 max-w-md bg-slate-900 rounded-xl px-3 py-2 flex items-center gap-1 h-14 shadow-inner">
                {[
                  25, 45, 75, 95, 60, 40, 85, 90, 70, 50, 80, 100, 65, 45, 90, 80, 55, 35, 70, 85, 40, 60, 95,
                  75, 45, 30, 80, 65, 90, 50, 35, 70, 85, 60, 40, 25,
                ].map((val, idx) => {
                  const isActiveBar = (idx / 36) * 100 <= generatedProgress;
                  const heightPct = isPlayingGenerated
                    ? Math.min(100, Math.max(15, val + (idx % 3 === 0 ? 20 : -15)))
                    : Math.max(15, val * 0.4);
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        isActiveBar
                          ? "bg-gradient-to-t from-blue-400 via-indigo-300 to-white"
                          : "bg-gradient-to-t from-slate-700 to-slate-500 opacity-60"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  );
                })}
              </div>

              {/* Métricas de Performance em Milissegundos */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/60 text-center min-w-[95px]">
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">
                    Latência Real
                  </span>
                  <strong className="text-base font-extrabold text-[#007BFF] font-mono block">
                    {lastResult.latencyMs} ms
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-center min-w-[95px]">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    RTF Factor
                  </span>
                  <strong className="text-sm font-bold text-emerald-700 font-mono block">
                    {(lastResult.latencyMs / (lastResult.durationSeconds * 1000)).toFixed(2)}x
                  </strong>
                </div>
              </div>
            </div>

            {/* Timeline Scrubber Bar Clicável para avançar/retroceder o áudio */}
            <div className="pt-2">
              <div
                onClick={handleSeekGenerated}
                className="w-full h-3 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer relative overflow-hidden transition-colors border border-slate-200/80 group"
                title="Clique em qualquer ponto para avançar ou retroceder o áudio"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#007BFF] to-[#6366F1] transition-all duration-75 relative"
                  style={{ width: `${Math.min(100, Math.max(0, generatedProgress))}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md border-2 border-blue-600 scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>{formatTime(activePlaybackTime)}</span>
                <span className="text-slate-400 font-sans text-[10px]">Clique na barra para navegar no áudio</span>
                <span>{formatTime(lastResult.durationSeconds)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INSPEÇÃO DO MANIFESTO JSON TÉCNICO ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowManifestInspector(!showManifestInspector)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-[#007BFF] transition-colors cursor-pointer"
          >
            <FileAudio className="w-4 h-4 text-[#007BFF]" />
            <span>Inspecionar Manifesto Técnico da Germani (JSON & XTTS v2)</span>
            {showManifestInspector ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyManifest}
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            {hasCopiedManifest ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar JSON</span>
              </>
            )}
          </button>
        </div>

        {showManifestInspector && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
              {JSON.stringify(GERMANI_ACOUSTIC_MANIFEST, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
