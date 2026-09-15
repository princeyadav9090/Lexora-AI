import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from src.core.config import settings
from src.models.orm.statute import Statute

async def test_retrieve():
    database_url = settings.DATABASE_URL
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
    engine = create_async_engine(database_url, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        # Query IPC Section 420
        stmt = select(Statute).where(Statute.act_name == "Indian Penal Code", Statute.section_number == "420")
        result = await session.execute(stmt)
        statute = result.scalar_one_or_none()
        
        if statute:
            print("Successfully retrieved statute:")
            print(f"Act: {statute.act_name}")
            print(f"Section: {statute.section_number} - {statute.section_title}")
            print(f"Text: {statute.text}")
        else:
            print("Failed to find statute.")

if __name__ == "__main__":
    asyncio.run(test_retrieve())
