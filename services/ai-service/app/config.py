import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    AI_SERVICE_HOST: str = "127.0.0.1"
    AI_SERVICE_PORT: int = 5005
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    DEFAULT_PROVIDER: str = "gemini" # 'gemini' | 'openai'
    MAX_CRM_STAGES: int = 10

    # Cloudflare R2 Storage for Voice Cloning and Assets
    R2_ENABLED: bool = False
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "bipesend-voices"
    R2_PUBLIC_URL: str = ""
    # Local Storage Root
    STORAGE_ROOT: str = "storage"

    # Redis Cache & Queue for Instant TTS
    REDIS_URL: str = "redis://localhost:6379"
    TTS_CACHE_ENABLED: bool = True
    TTS_CACHE_TTL_SECONDS: int = 604800  # 7 dias para frases frequentes
    TTS_MAX_CONCURRENT_SYNTHESIS: int = 2
settings = Settings()
