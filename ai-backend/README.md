# Lexora-AI Backend

This is the production-grade backend for the Lexora-AI project.

## Architecture
- **FastAPI**: Core API routing.
- **LangGraph**: Agentic workflow orchestration.
- **PostgreSQL**: Relational storage (exact text verification).
- **Qdrant**: Vector storage.
- **Neo4j**: Graph storage.

## Structure
- `src/api`: FastAPI routes and application initialization.
- `src/agents`: LangGraph workflows, nodes, and state management.
- `src/services`: Business logic (Retrieval, Reranking, Verification).
- `src/db`: Database connections.
- `src/models`: Domain schemas and ORM mapping.

## Running Locally

### With Docker Compose
Run the entire stack (API, Postgres, Qdrant, Neo4j) using Docker:
```bash
docker-compose up --build
```
The API will be available at `http://localhost:8000/docs`.

### Local Development (Virtual Env)
1. Set up databases (or just run `docker-compose up postgres qdrant neo4j`).
2. Create virtual environment: `python -m venv venv`
3. Activate: `source venv/bin/activate`
4. Install requirements: `pip install -r requirements.txt`
5. Run server: `uvicorn src.api.main:app --reload`
