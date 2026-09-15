import traceback
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from src.models.llm.factory import get_llm
from src.db.qdrant_client import get_qdrant_client
from src.services.embedder import EmbedderService
from src.services.hybrid_retriever import HybridRetriever
from src.services.pii_redactor import PIIRedactor

router = APIRouter()

class DraftRequest(BaseModel):
    prompt: str
    jurisdiction: Optional[str] = "India"

class DraftResponse(BaseModel):
    draft: str
    template_used: str

@router.post("/generate", response_model=DraftResponse)
async def generate_draft(request: DraftRequest):
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    
    try:
        qdrant = get_qdrant_client()
        embedder = EmbedderService("all-MiniLM-L6-v2")
        retriever = HybridRetriever(qdrant, embedder, collection_name="legal_templates")
        
        redactor = PIIRedactor()
        redacted_prompt = redactor.redact(request.prompt)
        
        # Retrieve closest template
        try:
            results = retriever.search(redacted_prompt, limit=1)
        except Exception as e:
            print(f"Warning: Failed to search templates (collection might be missing): {e}")
            results = []

        if not results:
            template_content = "No specific template found. Please draft a standard legal document based on the prompt."
            template_title = "None"
        else:
            best_match = results[0]["payload"]
            template_content = best_match["content"]
            template_title = best_match["title"]
            
        try:
            llm = get_llm()
            
            system_prompt = f"""You are an expert legal drafter for the jurisdiction of {request.jurisdiction}.
Draft a professional legal document based on the following requirements:
{redacted_prompt}

Use the following template structure as a guide:
{template_content}

Ensure the tone is formal and legally binding. Do NOT include placeholders, generate a complete draft.
"""

            
            response = llm.invoke(system_prompt)
            generated_text = response.content
        except Exception as e:
            print(f"Warning: LLM generation failed (API quota exceeded or invalid key): {e}")
            generated_text = f"## [MOCK DRAFT] {request.jurisdiction} Legal Document\n\nThis is a mock draft generated because the configured LLM API keys (Google/Nvidia) are out of quota or invalid.\n\nHowever, this confirms that the connection between the Node.js Backend and the Python AI Backend is working perfectly!\n\n**Prompt:** {request.prompt}"
        
        # Restore PII back to original forms
        restored_draft = redactor.restore(generated_text)
        
        return DraftResponse(
            draft=restored_draft,
            template_used=template_title
        )
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
