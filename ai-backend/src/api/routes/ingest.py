from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

from qdrant_client.models import PointStruct
from src.db.qdrant_client import get_qdrant_client, init_qdrant_collection
from src.services.embedder import EmbedderService

router = APIRouter()

COLLECTION_NAME = "pdf_knowledge_base"
VECTOR_SIZE = 384

class IngestRequest(BaseModel):
    document_id: str
    title: str
    text: str
    vault_id: Optional[str] = None

def chunk_text(text: str, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += (chunk_size - overlap)
    return chunks

@router.post("/ingest")
async def ingest_document(request: IngestRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
        
    try:
        qdrant = get_qdrant_client()
        init_qdrant_collection(qdrant, COLLECTION_NAME, VECTOR_SIZE)
        embedder = EmbedderService("all-MiniLM-L6-v2")
        
        chunks = chunk_text(request.text)
        points = []
        
        for i, chunk in enumerate(chunks):
            vector = embedder.embed_text(chunk)
            payload = {
                "document_id": request.document_id,
                "document_title": request.title,
                "chunk_index": i,
                "text": chunk,
                "vault_id": request.vault_id
            }
            point_id = str(uuid.uuid4())
            points.append(PointStruct(id=point_id, vector=vector, payload=payload))
            
        if points:
            qdrant.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            
        return {"success": True, "chunks_indexed": len(points)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
