from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any, Optional, Dict
from src.agents.graph import create_research_graph
from src.agents.state import ResearchState
from src.services.pii_redactor import PIIRedactor

router = APIRouter()

class ResearchMessage(BaseModel):
    role: str
    content: str

class ResearchQuery(BaseModel):
    messages: List[ResearchMessage]
    vault_id: Optional[str] = None

class ResearchResponse(BaseModel):
    is_complete: bool
    missing_information: str
    extracted_issues: List[str]
    retrieved_statutes: List[Dict[str, Any]]
    retrieved_precedents: List[Dict[str, Any]]
    flagged_citations: List[Dict[str, Any]]
    analysis: str
    counterarguments: str

@router.post("/analyze", response_model=ResearchResponse)
async def analyze_legal_query(request: ResearchQuery):
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty.")
    
    app = create_research_graph()
    redactor = PIIRedactor()
    
    # Redact PII from incoming messages
    redacted_messages = []
    for m in request.messages:
        redacted_messages.append({
            "role": m.role, 
            "content": redactor.redact(m.content)
        })
    
    initial_state: ResearchState = {
        "messages": redacted_messages,
        "vault_id": request.vault_id,
        "is_fact_gathering_complete": False,
        "missing_information": "",
        "extracted_issues": [],
        "jurisdictions": [],
        "conflict_of_laws": False,
        "retrieved_statutes": [],
        "retrieved_precedents": [],
        "flagged_citations": [],
        "analysis": "",
        "counterarguments": ""
    }
    
    try:
        final_state = app.invoke(initial_state)
        
        # De-mask PII from the final analysis and counterarguments
        restored_analysis = redactor.restore(final_state.get("analysis", ""))
        restored_counterarguments = redactor.restore(final_state.get("counterarguments", ""))
        
        return ResearchResponse(
            is_complete=final_state.get("is_fact_gathering_complete", False),
            missing_information=final_state.get("missing_information", ""),
            extracted_issues=final_state.get("extracted_issues", []),
            retrieved_statutes=final_state.get("retrieved_statutes", []),
            retrieved_precedents=final_state.get("retrieved_precedents", []),
            flagged_citations=final_state.get("flagged_citations", []),
            analysis=restored_analysis,
            counterarguments=restored_counterarguments
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
