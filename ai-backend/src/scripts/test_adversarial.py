import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.agents.graph import create_research_graph

def test_adversarial_counsel():
    app = create_research_graph()
    
    # Simulate a user providing full facts for an incident
    initial_state = {
        "messages": [
            {"role": "user", "content": "My friend borrowed 10,000 rupees from me on Monday, promising to pay it back by Friday. When Friday came, he blocked my number and vanished. This is clear cheating and fraud!"}
        ],
        "is_fact_gathering_complete": False,
        "missing_information": "",
        "extracted_issues": [],
        "retrieved_statutes": [],
        "retrieved_precedents": [],
        "analysis": "",
        "counterarguments": ""
    }
    
    print("Invoking graph...")
    final_state = app.invoke(initial_state)
    
    print("\n--- RESULTS ---")
    print(f"Is Complete: {final_state.get('is_fact_gathering_complete')}")
    print(f"Issues: {final_state.get('extracted_issues')}")
    print("\n[Senior Advocate Analysis]")
    print(final_state.get("analysis", "No analysis generated"))
    
    print("\n[Adversarial Counsel]")
    print(final_state.get("counterarguments", "No counterarguments generated"))

if __name__ == "__main__":
    test_adversarial_counsel()
