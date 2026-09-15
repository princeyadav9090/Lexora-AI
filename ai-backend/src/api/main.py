from fastapi import FastAPI
from src.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Lexora-AI Backend API for Legal Intelligence"
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}

from src.api.routes import research, ingest, timeline, draft

# Add routers here as they are developed
app.include_router(research.router, prefix="/api/v1/research", tags=["Research"])
app.include_router(ingest.router, prefix="/api/v1/ingest", tags=["Ingest"])
app.include_router(timeline.router, prefix="/api/v1/research", tags=["Timeline"])
app.include_router(draft.router, prefix="/api/v1/research", tags=["Draft"])
