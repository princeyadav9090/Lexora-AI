# Lexora-AI: Indian Legal Intelligence & Research System

## Overview
Lexora-AI is an advanced, AI-assisted legal research and case-analysis platform tailored specifically for the Indian legal system. It is designed to move beyond simplistic "LLM wrappers" or chatbots by implementing a robust, verifiability-first architecture. 

**Core Principle**: *The LLM generates and reasons; the legal evidence system verifies.*

Lexora-AI does not treat foundation models as the ultimate source of truth. Instead, it relies on complex legal knowledge engineering, hybrid retrieval (semantic, keyword, graph), structured document intelligence, and a dedicated evidence engine to ground all claims in verifiable Indian legal sources (Statutes, Sections, Judgments).

## Major Features
- **Case Understanding**: Translates natural language user scenarios into structured legal case objects.
- **Hybrid Legal Retrieval**: Combines semantic search, keyword search, metadata filtering, and Knowledge Graph traversal to find relevant precedents and statutes.
- **Legal Reranking**: Re-evaluates retrieved candidates based on legal issue similarity, court hierarchy, and temporal applicability.
- **Evidence Engine**: Analyzes user-uploaded documents (e.g., agreements, notices) to extract timelines and map them to legal claims.
- **Adversarial Legal Reasoning**: Generates not only supporting arguments but also counterarguments and weakness assessments via agentic workflows.
- **Citation Verification**: Ensures every generated legal claim is backed by a verifiable source, heavily penalizing and filtering out hallucinations.
- **Explainability**: Provides a transparent "Why did the AI say this?" trail for every assertion.

## High-Level Architecture
Lexora-AI is built on a highly modular architecture emphasizing separation of concerns:
1. **Data Processing Layer**: OCR, chunking, and embedding of Indian legal documents.
2. **Storage Layer**: PostgreSQL (relational data), Qdrant (vectors), Neo4j (legal knowledge graph).
3. **Retrieval Layer**: Hybrid search and dedicated ML reranker.
4. **Agent Orchestration**: LangGraph-based workflow engine managing the state of legal reasoning, evidence checking, and counterargument generation.
5. **Backend**: FastAPI providing stateless endpoints for the frontend.
6. **Frontend**: Next.js + TypeScript for a polished, responsive user interface.

## Tech Stack
- **Backend**: Python, FastAPI
- **AI/ML/Orchestration**: LangChain, LangGraph, HuggingFace (Embeddings/Rerankers)
- **Databases**: PostgreSQL (Relational), Qdrant (Vector), Neo4j (Graph)
- **Frontend**: Next.js, React, TypeScript
- **DevOps**: Docker, Docker Compose

*Note: The project is designed to be runnable on local, free, and open-source infrastructure (e.g., local LLMs via Ollama) to support academic and low-cost environments.*

## Development Workflow
Please refer to the `DEVELOPMENT_GUIDELINES.md` for our branching strategy, code standards, and PR workflows.
- Never commit `.env` or sensitive API keys.
- Ensure all new modules have corresponding unit tests.
- Keep the LLM providers abstracted.

## Project Roadmap
See `ROADMAP.md` and the `phases/` directory for a detailed, phase-by-phase breakdown of development. The project follows a 16-phase structured plan from initial data gathering to final benchmarking and deployment.

## ⚠️ Legal & Safety Disclaimer
**Lexora-AI is an AI-assisted research tool, NOT a replacement for a licensed advocate.**
This software does not provide legally binding advice, guarantee legal outcomes, or predict court decisions with certainty. It is built as an academic final-year project to demonstrate advanced ML/NLP applications in the legal domain. Users should always consult a qualified legal professional for actual legal matters.