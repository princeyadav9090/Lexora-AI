from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from src.services.embedder import EmbedderService

class HybridRetriever:
    def __init__(self, qdrant_client: QdrantClient, embedder: EmbedderService, collection_name: str = "statutes_vectors"):
        self.qdrant = qdrant_client
        self.embedder = embedder
        self.collection_name = collection_name
        
    def _build_filter(self, metadata_filters: Optional[Dict[str, str]]) -> Optional[Filter]:
        if not metadata_filters:
            return None
            
        must_conditions = []
        for key, value in metadata_filters.items():
            must_conditions.append(
                FieldCondition(key=key, match=MatchValue(value=value))
            )
            
        return Filter(must=must_conditions)

    def search(self, query: str, metadata_filters: Optional[Dict[str, str]] = None, limit: int = 5) -> List[Dict[str, Any]]:
        # 1. Embed the query
        query_vector = self.embedder.embed_text(query)
        
        # 2. Build metadata filter (if any)
        query_filter = self._build_filter(metadata_filters)
        
        # 3. Search Qdrant
        results = self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=limit
        )
        
        # Return formatted results
        formatted_results = []
        for res in results:
            formatted_results.append({
                "score": res.score,
                "payload": res.payload
            })
            
        return formatted_results
