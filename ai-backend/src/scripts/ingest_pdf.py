import asyncio
import uuid
import sys
import os
import pdfplumber

# Add src to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from qdrant_client.models import PointStruct
from src.db.qdrant_client import get_qdrant_client, init_qdrant_collection
from src.services.embedder import EmbedderService

COLLECTION_NAME = "pdf_knowledge_base"
VECTOR_SIZE = 384

def extract_text_from_pdf(pdf_path):
    text = ""
    print(f"Reading PDF: {pdf_path}")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- Page {i+1} ---\n" + page_text
        return text
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return ""

def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += (chunk_size - overlap)
    return chunks

def ingest_pdf(pdf_path, doc_title):
    qdrant = get_qdrant_client()
    init_qdrant_collection(qdrant, COLLECTION_NAME, VECTOR_SIZE)
    embedder = EmbedderService("all-MiniLM-L6-v2")

    full_text = extract_text_from_pdf(pdf_path)
    if not full_text:
        print("No text extracted.")
        return

    print("Chunking text...")
    chunks = chunk_text(full_text)
    print(f"Created {len(chunks)} chunks.")

    points = []
    print("Embedding chunks...")
    for i, chunk in enumerate(chunks):
        vector = embedder.embed_text(chunk)
        payload = {
            "document_title": doc_title,
            "chunk_index": i,
            "text": chunk
        }
        point_id = str(uuid.uuid4())
        points.append(PointStruct(id=point_id, vector=vector, payload=payload))

    if points:
        print("Upserting to Qdrant...")
        qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print("Successfully ingested PDF!")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python ingest_pdf.py <path_to_pdf> <document_title>")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    title = sys.argv[2]
    ingest_pdf(pdf_path, title)
