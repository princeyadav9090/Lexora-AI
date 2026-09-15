from src.core.config import settings

class EmbedderService:
    def __init__(self, model_name: str = "models/embedding-001"):
        if settings.GOOGLE_API_KEY:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            self.model = GoogleGenerativeAIEmbeddings(
                model=model_name,
                google_api_key=settings.GOOGLE_API_KEY
            )
        elif settings.OPENROUTER_API_KEY:
            from langchain_openai import OpenAIEmbeddings
            self.model = OpenAIEmbeddings(
                openai_api_key=settings.OPENROUTER_API_KEY,
                openai_api_base="https://openrouter.ai/api/v1",
                model="openai/text-embedding-3-small"
            )
        else:
            raise ValueError("No API key available for embeddings.")
        
    def embed_text(self, text: str) -> list[float]:
        return self.model.embed_query(text)
