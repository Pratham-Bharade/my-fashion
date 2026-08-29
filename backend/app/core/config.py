from typing import List, Union
import json
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    APP_NAME: str = "Vandana Creations — Sarees, Kurtis & Blouses"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite:///./fashion_boutique.db"

    # Security
    JWT_SECRET_KEY: str = "super-secret-key-change-this-in-production-fashion-2026-secure!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 100

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Business Defaults
    BUSINESS_NAME: str = "Vandana Creations"
    BUSINESS_EMAIL: str = "vandanabharade358@gmail.com"
    BUSINESS_PHONE: str = "+91 93222 28426"
    BUSINESS_WHATSAPP: str = "+919322228426"

    # Email / SMTP Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "vandanabharade358@gmail.com"
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "vandanabharade358@gmail.com"
    SMTP_FROM_NAME: str = "Vandana Creations Atelier"
    CONTACT_RECEIVER_EMAIL: str = "vandanabharade358@gmail.com"

    # AI Module (Modular / safe fallback)
    AI_ENABLED: bool = False
    AI_API_KEY: str = ""

settings = Settings()
