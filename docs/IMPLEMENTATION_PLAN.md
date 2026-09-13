# Lexora AI — Master Implementation Plan

Lexora AI ("Your Smart Legal Companion") is an AI-powered LegalTech MVP built for individuals, freelancers, students, and small businesses in India.

## Core Capabilities
1. **Guided AI Document Generator**: Generate NDA, Rental Agreement, Employment Contract, Freelance Agreement, Internship Agreement with structured human-language questionnaires.
2. **Legal Vault**: Secure document storage, upload processing (PDF, DOCX, TXT), structural chunking, vector indexing, versioning, and document management.
3. **AI Legal Assistant**: Dual-mode AI assistant providing (a) General legal information and educational QA, and (b) Grounded document-specific RAG QA with exact clause & page citations.
4. **Lawyer Marketplace & Consultations**: Discover verified lawyers, view profiles, request consultations, and manage bookings.
5. **Admin Panel**: Manage users, verify lawyers, toggle document templates, and review audit logs.

## Target Architecture
- **Frontend**: React 18+ (Vite SPA) + React Router DOM (JavaScript / JSX)
- **Backend**: Node.js + Express.js API Server (JavaScript / ES modules)
- **Authentication**: AWS Cognito User Pool authentication with JWT verification & Dev Adapter mode
- **Styling**: Tailwind CSS + Lucide React Icons + Framer Motion (Figma design visual language)
- **Database**: SQLite via Prisma ORM
- **AI & RAG**: Dual-adapter RAG engine supporting external APIs (Gemini/OpenAI) + zero-config built-in vector search fallback engine.
