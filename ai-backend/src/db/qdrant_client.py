from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from src.core.config import settings

def get_qdrant_client():
    return QdrantClient(url=settings.QDRANT_URL)

def init_qdrant_collection(client: QdrantClient, collection_name: str, vector_size: int):
    # Check if collection exists, if not, create it
    if not client.collection_exists(collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )
