from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel, Field
from typing import List
from src.agents.state import ResearchState
from src.models.llm.factory import get_llm
from src.db.qdrant_client import get_qdrant_client
from src.services.embedder import EmbedderService
from src.services.hybrid_retriever import HybridRetriever

class IntakeAnalysis(BaseModel):
    is_complete: bool = Field(description="True if all critical facts (who, what, when, where) are present. False if important details are missing.")
    missing_questions: str = Field(description="If is_complete is False, ask a clear clarifying question to the user. Otherwise, leave empty.")
    issues: List[str] = Field(description="The extracted core legal issues and conceptual scenarios.")
    jurisdictions: List[str] = Field(description="List of states or cities mentioned in the facts (e.g., ['Maharashtra', 'Delhi']).")
    conflict_of_laws: bool = Field(description="True if multiple jurisdictions are involved, indicating a potential conflict of laws.")

def junior_lawyer_node(state: ResearchState) -> ResearchState:
    print("\n--- NODE: junior_lawyer_node (Intake) ---")
    messages = state.get("messages", [])
    
    # Construct conversation history
    history = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in messages])
    
    llm = get_llm()
    structured_llm = llm.with_structured_output(IntakeAnalysis)
    
    prompt = f"""You are a Junior Legal Assistant for Lexora AI. Your job is to gather facts from the client before handing the case to the Senior Advocate.
**CRITICAL BOUNDARY:** You are strictly a legal assistant. If the user asks about medical advice, coding, math, general trivia, or anything non-legal, you MUST set is_complete to false and set missing_questions to: "I am Lexora AI, a specialized legal assistant. I cannot assist with non-legal matters. Please ask me a legal question." Do not proceed further.

If it IS a legal matter:
Review the conversation history. Do we have enough facts (Who, What, When, Where, and State) to analyze the legal situation?
**JURISDICTION CHECK:** If the issue involves state-specific subjects (like rent control, land, labor, or local police regulations) and the user HAS NOT specified a state, you MUST set is_complete to false and ask "In which state did this occur?".
If multiple states are detected (e.g., "Delhi and Maharashtra"), extract them into the jurisdictions list and set conflict_of_laws to True.

If yes, set is_complete to true and extract the core legal issues and jurisdictions.
If no, set is_complete to false and ask ONE follow-up question to get the missing facts.

Conversation History:
{history}
"""
    
    print("Junior Lawyer analyzing case facts...")
    result = structured_llm.invoke(prompt)
    
    return {
        "is_fact_gathering_complete": result.is_complete,
        "missing_information": result.missing_questions,
        "extracted_issues": result.issues,
        "jurisdictions": result.jurisdictions,
        "conflict_of_laws": result.conflict_of_laws
    }

def route_after_intake(state: ResearchState) -> str:
    if state.get("is_fact_gathering_complete"):
        print("Routing to -> retrieve_law_and_precedents_node")
        return "retrieve_law_and_precedents"
    else:
        print("Routing to -> END (Waiting for user input)")
        return END

def retrieve_law_and_precedents_node(state: ResearchState) -> ResearchState:
    print("\n--- NODE: retrieve_law_and_precedents_node ---")
    issues = state.get("extracted_issues", [])
    jurisdictions = state.get("jurisdictions", [])
    
    vault_id = state.get("vault_id")
    
    try:
        qdrant = get_qdrant_client()
        embedder = EmbedderService("all-MiniLM-L6-v2")
        retriever = HybridRetriever(qdrant, embedder)
        
        # Also search PDF knowledge base
        pdf_retriever = HybridRetriever(qdrant, embedder, collection_name="pdf_knowledge_base")
        all_statutes = []
        
        pdf_filters = {"vault_id": vault_id} if vault_id else None
        
        for issue in issues:
            # Search Statutes
            statute_results = retriever.search(issue, limit=3)
            for res in statute_results:
                if res["score"] > 0.45:
                    all_statutes.append(res["payload"])
            
            # Search PDF Knowledge Base with Vault Filtering
            pdf_results = pdf_retriever.search(issue, metadata_filters=pdf_filters, limit=3)
            for res in pdf_results:
                if res["score"] > 0.45:
                    # Map PDF chunk to look like a statute or precedent for context
                    pdf_payload = {
                        "act_name": res["payload"]["document_title"],
                        "section_number": f"Page/Chunk {res['payload']['chunk_index']}",
                        "text": res["payload"]["text"]
                    }
                    all_statutes.append(pdf_payload)
                
        # Deduplicate based on statute_id
        seen_ids = set()
        unique_statutes = []
        for stat in all_statutes:
            if stat.get("statute_id") not in seen_ids:
                seen_ids.add(stat.get("statute_id", "unknown"))
                unique_statutes.append(stat)
    except Exception as e:
        print(f"Vector search failed (likely mocked or empty): {e}")
        unique_statutes = []
            
    # Mocking Precedents for now since we haven't ingested any Case Laws yet
    mock_precedents = [
        {
            "case_name": "Kesavananda Bharati v. State of Kerala (Mocked Precedent)", 
            "summary": "A landmark case relevant to fundamental rights and deception.",
            "is_overruled": False,
            "status": "Good Law"
        },
        {
            "case_name": "State of OldLaw v. Example (Mocked Overruled Precedent)", 
            "summary": "This old case held that X is not Y.",
            "is_overruled": True,
            "status": "Overruled by Larger Bench",
            "overruled_by": "Supreme Court of India in NewLaw v. Example (2020)"
        }
    ]
            
    return {
        "retrieved_statutes": unique_statutes,
        "retrieved_precedents": mock_precedents
    }

def validity_checker_node(state: ResearchState) -> ResearchState:
    print("\n--- NODE: validity_checker_node (Citation Validity) ---")
    retrieved_precedents = state.get("retrieved_precedents", [])
    
    good_precedents = []
    flagged_citations = []
    
    for case in retrieved_precedents:
        if case.get("is_overruled", False):
            print(f"Warning: Stripping overruled case: {case.get('case_name')}")
            flagged_citations.append(case)
        else:
            good_precedents.append(case)
            
    return {
        "retrieved_precedents": good_precedents,
        "flagged_citations": flagged_citations
    }

def senior_advocate_node(state: ResearchState) -> ResearchState:
    print("\n--- NODE: senior_advocate_node (Analysis) ---")
    messages = state.get("messages", [])
    history = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in messages])
    
    statutes = state.get("retrieved_statutes", [])
    precedents = state.get("retrieved_precedents", [])
    jurisdictions = state.get("jurisdictions", [])
    conflict_of_laws = state.get("conflict_of_laws", False)
    
    llm = get_llm()
    
    statutes_context = "\n".join([f"Law: {s.get('act_name')} Section {s.get('section_number')} - {s.get('text', '')}" for s in statutes]) if statutes else "No statutes retrieved."
    precedents_context = "\n".join([f"Case: {p['case_name']} - {p['summary']}" for p in precedents])
    
    conflict_instruction = ""
    if conflict_of_laws and len(jurisdictions) > 1:
        conflict_instruction = f"""
**CRITICAL JURISDICTIONAL CONFLICT DETECTED**: The facts involve multiple jurisdictions: {', '.join(jurisdictions)}.
You MUST include a section titled "Jurisdictional Conflict & Forum Shopping" in your analysis.
In this section, explicitly analyze which state's laws apply, the pros and cons of filing in each jurisdiction, and advise on the most favorable forum for the client.
"""
    
    prompt = f"""You are a Senior Advocate. Analyze the client's case using the IRAC (Issue, Rule, Application, Conclusion) format.
Base your analysis ONLY on the retrieved statutes and precedents.
{conflict_instruction}

Case Facts (From Intake):
{history}

Retrieved Statutes:
{statutes_context}

Retrieved Precedents:
{precedents_context}

Write the final IRAC legal analysis:"""
    
    print("Senior Advocate drafting final analysis...")
    response = llm.invoke(prompt)
    
    return {"analysis": response.content}

def adversarial_counsel_node(state: ResearchState) -> ResearchState:
    print("\n--- NODE: adversarial_counsel_node (Adversarial) ---")
    messages = state.get("messages", [])
    history = "\n".join([f"{msg['role'].capitalize()}: {msg['content']}" for msg in messages])
    
    analysis = state.get("analysis", "")
    
    llm = get_llm()
    
    prompt = f"""You are the Opposing Counsel (Adversarial). Your job is to tear down the Senior Advocate's analysis and find weaknesses in the client's case.
    
Identify logical leaps, missing evidence, temporal issues (e.g., statute of limitations), or alternative interpretations that favor the opposing side.
Provide 3-4 bullet points outlining exactly how the opposing side will attack this case in court.

Client's Case Facts:
{history}

Senior Advocate's Draft Analysis:
{analysis}

Write the counterarguments clearly and concisely:"""
    
    print("Adversarial Counsel drafting counterarguments...")
    response = llm.invoke(prompt)
    
    return {"counterarguments": response.content}

def create_research_graph():
    workflow = StateGraph(ResearchState)
    
    workflow.add_node("junior_lawyer", junior_lawyer_node)
    workflow.add_node("retrieve_law_and_precedents", retrieve_law_and_precedents_node)
    workflow.add_node("validity_checker", validity_checker_node)
    workflow.add_node("senior_advocate", senior_advocate_node)
    workflow.add_node("adversarial_counsel", adversarial_counsel_node)
    
    workflow.add_edge(START, "junior_lawyer")
    
    # Conditional Routing
    workflow.add_conditional_edges(
        "junior_lawyer",
        route_after_intake,
        {
            "retrieve_law_and_precedents": "retrieve_law_and_precedents",
            END: END
        }
    )
    
    workflow.add_edge("retrieve_law_and_precedents", "validity_checker")
    workflow.add_edge("validity_checker", "senior_advocate")
    workflow.add_edge("senior_advocate", "adversarial_counsel")
    workflow.add_edge("adversarial_counsel", END)
    
    app = workflow.compile()
    return app
