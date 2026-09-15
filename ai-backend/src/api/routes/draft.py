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
        results = retriever.search(redacted_prompt, limit=1)
        if not results:
            template_content = "No specific template found. Please draft a standard legal document based on the prompt."
            template_title = "None"
        else:
            best_match = results[0]["payload"]
            template_content = best_match["content"]
            template_title = best_match["title"]
            
        llm = get_llm()
        
        system_prompt = f"""You are Lexora AI, an expert legal drafting agent.
Your task is to draft a production-ready legal document based on the user's prompt and the provided verified template.

User Request: {redacted_prompt}
Jurisdiction Context: {request.jurisdiction}

Verified Template:
{template_content}

RULES:
1. Ground your draft strictly in the provided template structure.
2. If the user provided facts (e.g., names, dates, amounts), fill them into the template where appropriate.
3. If ANY critical facts are missing to complete the draft, you MUST use brackets like [INSERT DATE], [INSERT DEFENDANT NAME], rather than hallucinating facts.
4. Adapt the jurisdictional header if a specific location is mentioned in the prompt or jurisdiction context (e.g., "High Court of Judicature at Bombay" for Mumbai).
5. Output ONLY the drafted document text in Markdown format.
"""
        
        response = llm.invoke(system_prompt)
        
        # Restore PII back to original forms
        restored_draft = redactor.restore(response.content)
        
        return DraftResponse(
            draft=restored_draft,
            template_used=template_title
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
