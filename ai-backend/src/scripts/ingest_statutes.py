import asyncio
import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from qdrant_client.http.models import PointStruct
import uuid

# Setup Python Path for script execution
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.db.postgres import engine, Base, AsyncSessionLocal
from src.db.models import Statute
from src.db.qdrant_client import get_qdrant_client
from src.services.embedder import EmbedderService

async def init_db():
    print("Initializing Postgres schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
async def ingest_statutes():
    # Load JSON
    file_path = os.path.join("data", "raw", "ipc_sample.json")
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return
        
    with open(file_path, "r") as f:
        data = json.load(f)
        
    print(f"Loaded {len(data)} statutes from JSON.")
    
    # 1. Ingest into PostgreSQL
    async with AsyncSessionLocal() as session:
        for item in data:
            # Check if exists
            statute = Statute(
                statute_id=item["statute_id"],
                act_name=item["act_name"],
                chapter=item["chapter"],
                section_number=item["section_number"],
                section_title=item["section_title"],
                text=item["text"]
            )
            # Use merge to update if exists, insert if not
            await session.merge(statute)
        await session.commit()
        print("Successfully ingested into PostgreSQL.")
        
    # 2. Ingest into Qdrant
    qdrant = get_qdrant_client()
    embedder = EmbedderService("all-MiniLM-L6-v2")
    
    points = []
    for item in data:
        print(f"Embedding {item['statute_id']}...")
        vector = embedder.embed_text(item["text"])
        
        # Qdrant requires an integer or UUID string for IDs
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, item["statute_id"]))
        
        payload = {
            "statute_id": item["statute_id"],
            "act_name": item["act_name"],
            "section_number": item["section_number"],
            "section_title": item["section_title"],
            "text": item["text"]
        }
        
        points.append(PointStruct(id=point_id, vector=vector, payload=payload))
        
    from qdrant_client.models import VectorParams, Distance
    qdrant.recreate_collection(
        collection_name="statutes",
        vectors_config=VectorParams(size=len(vector), distance=Distance.COSINE)
    )
        
    qdrant.upsert(
        collection_name="statutes",
        points=points
    )
    print("Successfully indexed into Qdrant Vector DB.")

async def main():
    await init_db()
    await ingest_statutes()

if __name__ == "__main__":
    asyncio.run(main())
