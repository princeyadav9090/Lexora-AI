from src.agents.graph import create_research_graph
from src.agents.state import ResearchState


def main():
    print("Initializing LangGraph with LLM Integration...")
    app = create_research_graph()
    
    # We use a query that maps to Section 420 conceptually
    query = "A person sold me a car but lied about its condition, and when I asked for my money back they ran away. Is this a crime?"
    
    initial_state: ResearchState = {
        "query": query,
        "extracted_issues": [],
        "retrieved_statutes": [],
        "analysis": ""
    }
    
    print(f"\n==================================================")
    print(f"Starting End-to-End LLM Pipeline Execution")
    print(f"Query: '{initial_state['query']}'")
    print("==================================================")
    
    try:
        final_state = app.invoke(initial_state)
        
        print("\n==================================================")
        print("FINAL LEGAL ANALYSIS:")
        print("==================================================")
        print(final_state["analysis"])
        
    except Exception as e:
        print(f"\nError during execution: {e}")

if __name__ == "__main__":
    main()
