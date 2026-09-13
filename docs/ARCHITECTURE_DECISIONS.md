# Lexora AI — Architecture Decisions (ADR)

## ADR 01: Framework & Language Selection — Node.js & React (JavaScript ES6+/JSX)
- **Decision**: Use pure JavaScript (`.js` / `.jsx`) across both Node.js (Express API server) and React 18+ (Vite SPA frontend with React Router).
- **Rationale**: Strict adherence to user preferences, eliminating TypeScript compilation overhead while maintaining clear REST API contracts and clean modular React component architecture.

## ADR 02: Database & Persistence — SQLite with Prisma ORM
- **Decision**: Use Prisma ORM with SQLite file-based database (`prisma/dev.db`).
- **Rationale**: Zero external setup required, fast execution, full ACID compliance, easy database schema migrations, and simple seeding for development and demo environments.

## ADR 03: Controlled AI Document Generator
- **Decision**: Use structured schema validation + approved template clause engine + bounded AI assistance.
- **Rationale**: Prevents LLM hallucinations or unstructured legal clause generation. Ensures generated legal drafts strictly follow Indian legal standards and schema rules.

## ADR 04: Dual-Mode RAG Architecture & Security
- **Decision**: Implement dual-mode vector search (supporting OpenAI/Gemini APIs + built-in zero-dependency vector engine) with strict ownership metadata filtering (`userId`, `documentId`).
- **Rationale**: Guarantees multi-tenant data isolation so users can never access or query other users' document chunks.

## ADR 05: Authentication — AWS Cognito Identity Provider
- **Decision**: Implement AWS Cognito User Pools authentication (`@aws-sdk/client-cognito-identity-provider`) for user registration, login, session tokens, and JWT verification, paired with a seamless development adapter for local fallback.
- **Rationale**: Provides enterprise-grade cloud authentication with AWS Cognito User Pools while maintaining instant local dev capability.
