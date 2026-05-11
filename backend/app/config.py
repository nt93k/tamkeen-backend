"""
إعدادات التطبيق — يتم تحميل المتغيرات الحساسة من ملف .env بشكل آمن
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """إعدادات التطبيق الرئيسية — محملة من ملف .env"""

    # Google Gemini
    GEMINI_API_KEY: str

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # App
    APP_ENV: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "تمكين"
    APP_VERSION: str = "1.0.0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    """إرجاع إعدادات مخزنة مؤقتاً — يتم تحميلها مرة واحدة فقط"""
    return Settings()


# Instance عام للاستخدام في جميع أنحاء التطبيق
settings = get_settings()
