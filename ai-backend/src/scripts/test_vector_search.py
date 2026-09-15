from src.db.qdrant_client import get_qdrant_client
from src.services.embedder import EmbedderService

COLLECTION_NAME = "statutes_vectors"

def main():
    qdrant = get_qdrant_client()
    print("Loading embedding model...")
    embedder = EmbedderService("all-MiniLM-L6-v2")
    
    # A conceptual query that doesn't mention "Section 420" directly.
    query = "someone lied to me and took my money"
    print(f"\nQuerying: '{query}'")
    
    query_vector = embedder.embed_text(query)
    
    results = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=2
    )
    
    print("\n--- Top Results ---")
    for res in results:
        payload = res.payload
        score = res.score
        print(f"Score: {score:.4f}")
        print(f"Act: {payload.get('act_name')}")
        print(f"Section: {payload.get('section_number')} - {payload.get('section_title')}")
        print("-" * 20)

if __name__ == "__main__":
    main()
