from src.db.qdrant_client import get_qdrant_client
from src.services.embedder import EmbedderService
from src.services.hybrid_retriever import HybridRetriever

def main():
    print("Initializing clients...")
    qdrant = get_qdrant_client()
    embedder = EmbedderService("all-MiniLM-L6-v2")
    retriever = HybridRetriever(qdrant, embedder)
    
    query = "someone lied to me and took my money"
    
    print("\n=============================================")
    print(f"Test 1: Unfiltered Semantic Search")
    print(f"Query: '{query}'")
    print("=============================================")
    
    unfiltered_results = retriever.search(query, limit=2)
    for res in unfiltered_results:
        print(f"Score: {res['score']:.4f} | Act: {res['payload']['act_name']} | Section: {res['payload']['section_number']}")


    print("\n=============================================")
    print(f"Test 2: Filtered Semantic Search (Only IPC)")
    print(f"Query: '{query}'")
    print("Filter: {'act_name': 'Indian Penal Code'}")
    print("=============================================")
    
    filtered_results = retriever.search(query, metadata_filters={"act_name": "Indian Penal Code"}, limit=2)
    for res in filtered_results:
        print(f"Score: {res['score']:.4f} | Act: {res['payload']['act_name']} | Section: {res['payload']['section_number']}")

if __name__ == "__main__":
    main()
