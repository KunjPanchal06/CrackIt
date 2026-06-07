from pydantic_settings import BaseSettings
from typing import List

"""
Application configuration using Pydantic Settings.

Reads environment variables from .env file and provides
typed, validated configuration to the rest of the application.

All secrets and environment-specific values are defined here —
NEVER hardcode API keys or secrets in source code.
"""


class Settings(BaseSettings):
    # ---------- Application ----------
    app_env: str = "development"
    cors_origins: str = "http://localhost:5173"  # Comma-separated origins

    # ---------- Supabase ----------
    supabase_url: str = ""
    supabase_service_key: str = ""  # Service role key (server-side only, never expose)
    supabase_jwt_secret: str = ""

    # ---------- Groq ----------
    groq_api_key: str = ""

    # ---------- Redis (Upstash) ----------
    redis_url: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Singleton instance — import this throughout the app
settings = Settings()
