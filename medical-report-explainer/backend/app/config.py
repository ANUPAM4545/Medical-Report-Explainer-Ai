from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str = ""
    vector_db_path: str = "./vector_store"
    upload_dir: str = "./uploads"
    auth_db_path: str = "./auth.db"
    auth_secret_key: str = "change-this-secret-in-production"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    chroma_collection: str = "medical_reports"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def vector_path(self) -> Path:
        return Path(self.vector_db_path).resolve()

    @property
    def uploads_path(self) -> Path:
        return Path(self.upload_dir).resolve()

    @property
    def auth_db(self) -> Path:
        path = Path(self.auth_db_path).resolve()
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.vector_path.mkdir(parents=True, exist_ok=True)
    settings.uploads_path.mkdir(parents=True, exist_ok=True)
    return settings
