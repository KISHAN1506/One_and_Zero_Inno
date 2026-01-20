from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "LearnPath API"
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./learnpath.db"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
