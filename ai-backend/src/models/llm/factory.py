from langchain_core.language_models.chat_models import BaseChatModel
from src.core.config import settings

def get_llm() -> BaseChatModel:
    if settings.GOOGLE_API_KEY:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(model="gemini-3.6-flash", temperature=0, api_key=settings.GOOGLE_API_KEY)
    elif settings.NVIDIA_API_KEY:
        from langchain_nvidia_ai_endpoints import ChatNVIDIA
        return ChatNVIDIA(model=settings.NVIDIA_MODEL_NAME, temperature=0, api_key=settings.NVIDIA_API_KEY)
    else:
        raise ValueError("No LLM API key provided in environment variables.")
