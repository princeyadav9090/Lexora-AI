from src.agents.graph import create_research_graph
from src.agents.state import ResearchState

def main():
    print("Initializing LangGraph...")
    app = create_research_graph()
    
    initial_state: ResearchState = {
        "query": "someone lied to me and took my money",
        "extracted_issues": [],
        "retrieved_statutes": [],
        "analysis": ""
    }
    
    print(f"\nStarting Execution with Query: '{initial_state['query']}'")
    print("==================================================")
    
    # Stream the graph execution to observe step-by-step state mutation
    for output in app.stream(initial_state):
        # 'output' is a dict mapping node_name -> state_update
        for node_name, state_update in output.items():
            print(f"\nOutput from {node_name}:")
            print(state_update)
            
    print("\n==================================================")
    print("Execution Finished.")

if __name__ == "__main__":
    main()
