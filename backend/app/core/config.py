from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "QuantMaster"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./quantmaster.db"

    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"

    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    DEEPSEEK_API_KEY: str = "sk-0c8df273129442b6b8bdfa2bca0198a0"
    DEEPSEEK_MODEL: str = "deepseek-chat"
    DEEPSEEK_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
