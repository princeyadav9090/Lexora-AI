import asyncio
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from qdrant_client.models import PointStruct

from src.core.config import settings
from src.models.orm.statute import Statute
from src.db.qdrant_client import get_qdrant_client, init_qdrant_collection
from src.services.embedder import EmbedderService

COLLECTION_NAME = "statutes_vectors"
VECTOR_SIZE = 384 # all-MiniLM-L6-v2 output dimension

async def fetch_all_statutes():
    database_url = settings.DATABASE_URL
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
    engine = create_async_engine(database_url, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        stmt = select(Statute)
        result = await session.execute(stmt)
        return result.scalars().all()

def main():
    print("Fetching statutes from Postgres...")
    statutes = asyncio.run(fetch_all_statutes())
    print(f"Found {len(statutes)} statutes.")

    print("Initializing Qdrant client and collection...")
    qdrant = get_qdrant_client()
    init_qdrant_collection(qdrant, COLLECTION_NAME, VECTOR_SIZE)
    
    print("Loading embedding model...")
    embedder = EmbedderService("all-MiniLM-L6-v2")
    
    points = []
    for stat in statutes:
        # Context Injection: prepend Act and Section to text so vector retains context
        text_to_embed = f"Act: {stat.act_name}, Section {stat.section_number} - {stat.section_title}\n\n{stat.text}"
        vector = embedder.embed_text(text_to_embed)
        
        payload = {
            "statute_id": stat.id,
            "act_name": stat.act_name,
            "section_number": stat.section_number,
            "section_title": stat.section_title,
            "text": stat.text
        }
        
        point_id = str(uuid.uuid4())
        points.append(PointStruct(id=point_id, vector=vector, payload=payload))
        
    if points:
        print("Upserting vectors to Qdrant...")
        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print("Vectors successfully upserted!")
    else:
        print("No statutes to embed.")

if __name__ == "__main__":
    main()
