from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Lexora-AI API"
    
    # Database Settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/lexora"
    QDRANT_URL: str = "http://localhost:6333"
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    
    # API Keys
    NVIDIA_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_SAFE_BROWSING_API_KEY: Optional[str] = None
    VIRUSTOTAL_API_KEY: Optional[str] = None
    LANGCHAIN_API_KEY: Optional[str] = None
    NVIDIA_MODEL_NAME: str = "google/gemma-2-2b-it"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
