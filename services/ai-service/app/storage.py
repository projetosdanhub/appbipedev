"""
BipeSend AI Service — Enterprise Storage Adapter (Local + Cloudflare R2).

Provides automated, organized directory structures per client/tenant:
  storage/tenants/{tenant_id}/
    ├── voices/
    │   ├── reference/    # Áudios base enviados pelo cliente para clonagem
    │   ├── cloned/       # Áudios sintetizados gerados pela IA
    │   └── models/       # Embeddings latentes do falante (latents.pth)
    ├── images/           # Fotos de produtos, catálogos, logos
    ├── videos/           # Vídeos de demonstração, mídia institucional
    ├── documents/        # PDFs de propostas, manuais, bases de conhecimento (RAG)
    └── temp/             # Arquivos temporários de conversão e upload

Cloudflare R2 mirrors the exact same prefix hierarchy:
  tenants/{tenant_id}/voices/reference/...
  tenants/{tenant_id}/voices/cloned/...
  tenants/{tenant_id}/images/...
  tenants/{tenant_id}/videos/...
  tenants/{tenant_id}/documents/...
"""

import io
import json
import logging
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Union

from app.config import settings

logger = logging.getLogger("bipesend.storage")

TENANT_CATEGORIES = [
    "voices/reference",
    "voices/cloned",
    "voices/models",
    "images",
    "videos",
    "documents",
    "temp",
]


class TenantStorageManager:
    """
    Manages client-isolated storage locally and seamlessly mirrors to Cloudflare R2.
    """

    def __init__(self, root_dir: Optional[Path] = None):
        self._s3_client = None
        self._r2_enabled = settings.R2_ENABLED and bool(
            settings.R2_ACCOUNT_ID and settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY
        )

        app_dir = Path(__file__).parent
        self.root_dir = root_dir or (app_dir.parent / settings.STORAGE_ROOT)
        self.tenants_root = self.root_dir / "tenants"
        self.tenants_root.mkdir(parents=True, exist_ok=True)

        if self._r2_enabled:
            self._init_r2_client()

    def _init_r2_client(self):
        """Initialize boto3 client for Cloudflare R2."""
        try:
            import boto3
            from botocore.config import Config

            endpoint_url = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
            self._s3_client = boto3.client(
                "s3",
                endpoint_url=endpoint_url,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                config=Config(signature_version="s3v4"),
                region_name="auto",
            )
            logger.info(f"Cloudflare R2 storage initialized (bucket: {settings.R2_BUCKET_NAME})")
        except Exception as e:
            logger.error(f"Failed to initialize Cloudflare R2 client: {e}")
            self._r2_enabled = False
            self._s3_client = None

    @property
    def is_r2_enabled(self) -> bool:
        return self._r2_enabled and self._s3_client is not None

    def ensure_tenant_folders(self, tenant_id: str) -> Dict[str, Path]:
        """
        Automatically provisions all organized asset folders for a client.
        Creates: voices/reference, voices/cloned, voices/models, images, videos, documents, temp.
        """
        clean_tenant_id = "".join(c for c in tenant_id if c.isalnum() or c in ("-", "_")).strip()
        if not clean_tenant_id:
            clean_tenant_id = "default"

        tenant_base = self.tenants_root / clean_tenant_id
        paths: Dict[str, Path] = {"root": tenant_base}

        for cat in TENANT_CATEGORIES:
            cat_path = tenant_base / cat
            cat_path.mkdir(parents=True, exist_ok=True)
            paths[cat] = cat_path

        return paths

    def get_tenant_dir(self, tenant_id: str, category: str = "voices/cloned") -> Path:
        """
        Returns the absolute local Path for a tenant's subcategory, creating it automatically.
        """
        folders = self.ensure_tenant_folders(tenant_id)
        if category in folders:
            return folders[category]
        custom_path = folders["root"] / category
        custom_path.mkdir(parents=True, exist_ok=True)
        return custom_path

    def save_tenant_file(
        self,
        tenant_id: str,
        category: str,
        filename: str,
        content: Union[bytes, Path],
        content_type: str = "application/octet-stream",
    ) -> Dict[str, Union[str, int, bool]]:
        """
        Saves an asset into the tenant's isolated folder locally and syncs to Cloudflare R2 if enabled.
        """
        target_dir = self.get_tenant_dir(tenant_id, category)
        clean_filename = Path(filename).name
        dest_path = target_dir / clean_filename

        # Write locally
        if isinstance(content, Path):
            shutil.copy2(content, dest_path)
            file_size = dest_path.stat().st_size
        else:
            with open(dest_path, "wb") as f:
                f.write(content)
            file_size = len(content)

        r2_key = f"tenants/{tenant_id}/{category}/{clean_filename}"
        r2_url = None

        # Sync to Cloudflare R2 if active
        if self.is_r2_enabled:
            try:
                with open(dest_path, "rb") as f:
                    self._s3_client.upload_fileobj(
                        f,
                        settings.R2_BUCKET_NAME,
                        r2_key,
                        ExtraArgs={"ContentType": content_type},
                    )
                if settings.R2_PUBLIC_URL:
                    base_url = settings.R2_PUBLIC_URL.rstrip("/")
                    r2_url = f"{base_url}/{r2_key}"
                else:
                    r2_url = f"https://{settings.R2_BUCKET_NAME}.r2.cloudflarestorage.com/{r2_key}"
                logger.info(f"Synced tenant file to R2: {r2_key}")
            except Exception as e:
                logger.warning(f"Failed to sync {clean_filename} to R2: {e}")

        return {
            "tenant_id": tenant_id,
            "category": category,
            "filename": clean_filename,
            "local_path": str(dest_path),
            "r2_key": r2_key if self.is_r2_enabled else None,
            "r2_url": r2_url,
            "size": file_size,
            "content_type": content_type,
            "r2_synced": r2_url is not None,
        }

    def list_tenant_files(
        self, tenant_id: str, category: Optional[str] = None
    ) -> List[Dict[str, Union[str, int]]]:
        """
        Lists stored assets for a client, optionally filtered by category.
        """
        self.ensure_tenant_folders(tenant_id)
        tenant_base = self.tenants_root / tenant_id
        results: List[Dict[str, Union[str, int]]] = []

        categories_to_scan = [category] if category else TENANT_CATEGORIES

        for cat in categories_to_scan:
            cat_dir = tenant_base / cat
            if not cat_dir.exists():
                continue
            for item in cat_dir.iterdir():
                if item.is_file():
                    stat = item.stat()
                    r2_key = f"tenants/{tenant_id}/{cat}/{item.name}"
                    r2_url = (
                        f"{settings.R2_PUBLIC_URL.rstrip('/')}/{r2_key}"
                        if self.is_r2_enabled and settings.R2_PUBLIC_URL
                        else None
                    )
                    results.append(
                        {
                            "filename": item.name,
                            "category": cat,
                            "local_path": str(item),
                            "size": stat.st_size,
                            "created_at": stat.st_mtime,
                            "r2_url": r2_url,
                        }
                    )

        return results


# Backward compatibility and global instances
class VoiceStorage(TenantStorageManager):
    """Voice-focused storage adapter with backward compatibility."""

    def save_voice_file(self, voice_id: str, file_path: Path, content_type: str = "audio/wav") -> Optional[str]:
        res = self.save_tenant_file(
            tenant_id="global",
            category="voices/reference",
            filename=file_path.name,
            content=file_path,
            content_type=content_type,
        )
        return res.get("r2_url")

    def save_voice_metadata(self, voice_id: str, metadata: dict) -> None:
        if not self.is_r2_enabled:
            return
        key = f"voices/{voice_id}/metadata.json"
        try:
            data = json.dumps(metadata, indent=2, ensure_ascii=False).encode("utf-8")
            self._s3_client.upload_fileobj(
                io.BytesIO(data),
                settings.R2_BUCKET_NAME,
                key,
                ExtraArgs={"ContentType": "application/json"},
            )
        except Exception as e:
            logger.warning(f"Failed to upload voice metadata to R2: {e}")

    def sync_from_r2_if_missing(self, voice_id: str, local_dest_dir: Path) -> Optional[Path]:
        if not self.is_r2_enabled:
            return None
        expected_wav = local_dest_dir / f"{voice_id}.wav"
        if expected_wav.exists():
            return expected_wav
        key = f"tenants/global/voices/reference/{voice_id}.wav"
        try:
            self._s3_client.download_file(
                settings.R2_BUCKET_NAME,
                key,
                str(expected_wav),
            )
            return expected_wav
        except Exception:
            return None


tenant_storage = TenantStorageManager()
voice_storage = VoiceStorage()
