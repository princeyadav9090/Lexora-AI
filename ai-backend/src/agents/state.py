from typing import TypedDict, List, Dict, Any, Optional

class ResearchState(TypedDict):
    """
    The shared state passed across the LangGraph nodes.
    """
    # Conversational memory
    messages: List[Dict[str, str]]
    vault_id: Optional[str]
    
    # Junior Lawyer Extraction
    is_fact_gathering_complete: bool
    missing_information: str
    extracted_issues: List[str]
    jurisdictions: List[str]
    conflict_of_laws: bool
    
    # Senior Advocate Retrieval & Generation
    retrieved_statutes: List[Dict[str, Any]]
    retrieved_precedents: List[Dict[str, Any]]
    flagged_citations: List[Dict[str, Any]]
    analysis: str
    
    # Adversarial Counsel
    counterarguments: str
