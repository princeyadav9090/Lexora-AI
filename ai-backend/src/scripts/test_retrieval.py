import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.db.qdrant_client import get_qdrant_client
from src.services.embedder import EmbedderService
from src.services.hybrid_retriever import HybridRetriever

def test_retriever():
    qdrant = get_qdrant_client()
    embedder = EmbedderService("all-MiniLM-L6-v2")
    retriever = HybridRetriever(qdrant, embedder)
    
    query = "Someone stole my money by deceiving me"
    results = retriever.search(query, limit=2)
    
    print(f"Top results for: '{query}'")
    for res in results:
        payload = res["payload"]
        print(f"\n- {payload['act_name']} Section {payload['section_number']}: {payload['section_title']}")
        print(f"  Score: {res['score']}")
        
if __name__ == "__main__":
    test_retriever()
