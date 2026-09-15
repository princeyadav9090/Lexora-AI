# Lexora-AI: Advanced Master Operating Rules 🛡️

This document serves as the absolute, non-negotiable constitution for AI interaction, code generation, and architectural decisions within the Lexora-AI workspace. All agents MUST read and strictly adhere to these rules before taking any action.

---

## 1. Zero-Assumption Protocol (The "Ask First" Rule)
- **No Guesswork:** You are forbidden from guessing missing context, API keys, credentials, or architectural intent.
- **Explicit Instruction:** If any information is missing, **stop execution immediately** and provide the user with clear instructions on what is needed.
- **Human-in-the-Loop:** Major architectural changes, database schema modifications, or UX paradigm shifts require explicit user approval. Present options clearly and wait for a decision.

## 2. Strict No-Hardcoding Policy
- **Dynamic Configuration:** Never hardcode secrets, API keys, environment variables, or environment-specific URLs (e.g., `http://localhost:8000`) in production code.
- **Environment Variables:** Always use `.env` files and configuration loaders (e.g., `process.env` in Node, `os.getenv` or `pydantic-settings` in Python).
- **Mock Data:** Only use mock data in explicit testing directories or when requested for a UI mockup.

## 3. UI/UX Design & Aesthetic Adherence
- **Color Palette Lock:** The UI must strictly utilize the existing premium theme. Do not introduce new colors without permission.
  - Backgrounds: `#FAF8F5` (Off-white), `#FFFFFF` (White)
  - Primary Text/Dark Elements: `#2D1C13` (Deep espresso)
  - Accents/Buttons: `#E07A5F` (Terracotta)
  - Highlights: `#FEF7E0` (Warm yellow)
- **Typography:** Strictly use `Plus Jakarta Sans` for body/sans-serif and `Playfair Display` for headings/serifs.
- **Aesthetic Standard:** Designs must feel premium, agentic, and highly polished. Utilize glassmorphism, micro-animations, and clean typography. Avoid generic MVP aesthetics.

## 4. Multi-Agent AI Architecture Integrity (Python/LangGraph)
- **Separation of Concerns:** The LangGraph nodes must remain strictly modular:
  - **Junior Lawyer:** Fact-gathering and boundary enforcement.
  - **Retrieval:** Qdrant-based RAG operations (Statutes + PDFs).
  - **Senior Advocate:** Primary legal analysis and structuring.
  - **Adversarial Counsel:** Stress-testing and counterarguments.
- **Legal Boundaries:** The AI must strictly refuse to answer non-legal queries (medical, coding, general trivia).
- **Zero Hallucination Tolerance:** Every legal claim must be grounded in a retrieved statute, case law, or ingested PDF. Do not allow the LLM to rely on its internal training data for specific Indian laws.

## 5. System Integration (Node.js & Python)
- **Distributed Architecture:** The system consists of three distinct layers. Do not attempt to merge them.
  1. **Frontend:** React/Vite (UI Layer)
  2. **Backend API:** Node.js/Express with Prisma/PostgreSQL (Auth, Routing, DB)
  3. **AI Engine:** Python/FastAPI with LangGraph (Reasoning, Vector Search)
- **Inter-service Communication:** The Node.js backend must act as the orchestrator/proxy, making HTTP requests to the Python AI Engine. The frontend should never directly contact the Python engine.

## 6. Data Privacy & Security
- **PII Protection:** Assume all uploaded documents (NDAs, contracts) contain highly sensitive Personally Identifiable Information (PII). Ensure redaction pipelines are respected before data is sent to external LLMs.
- **Database Safety:** Never execute raw SQL queries that bypass Prisma (Node) or SQLAlchemy (Python) ORMs without explicit permission.

## 7. Phased Execution Workflow
- **Follow the Roadmap:** The project is strictly divided into `phases/`. Do not jump ahead or implement features belonging to a future phase unless instructed.
- **Task Tracking:** Maintain and update the `task.md` and `walkthrough.md` artifacts diligently as you complete phase requirements.

---

## 8. Elite Engineering Standards (Based on Top Open-Source Repositories)
Drawing from the best practices of leading repositories (like Next.js, LangChain, and `awesome-cursorrules`), all generated code must adhere to the following standards:

### **Tech Stack Specifications**
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React (Icons).
- **Backend (Node):** Express.js, Prisma ORM, PostgreSQL.
- **Backend (AI):** Python 3.9+, FastAPI, LangGraph, Qdrant (Vector DB).

### **Code Quality & Modularity**
- **DRY & Modular:** Keep components small, functional, and reusable. Do not dump all logic into a single monolithic file.
- **Positive Instructions (Do X):** Write code that explicitly handles the "happy path" first. Use early returns and guard clauses to handle errors instead of deeply nested `if/else` statements.
- **Type Safety:** Use strict variable typing. In Node/React, use clear PropTypes or JSDoc if TypeScript is not enabled. In Python, strictly use Type Hints (e.g., `def parse_data(input: str) -> Dict[str, Any]:`).

### **Performance & React Best Practices**
- **No Inline Styles:** Always use Tailwind utility classes.
- **Optimized Rendering:** Use `useEffect` and `useState` efficiently to prevent unnecessary re-renders.
- **Explicit Imports:** Avoid wildcard imports (e.g., `from module import *`). Explicitly declare what you are importing.

### **Verification Before Completion**
- Before concluding a task, actively verify your work:
  - Did I accidentally hardcode a secret?
  - Does this UI change respect the `#2D1C13` and `#E07A5F` palette?
  - Does this Python function have type hints?

> **AGENT DIRECTIVE:** By operating in this workspace, you acknowledge these rules. If an instruction conflicts with these rules, default to these rules and alert the user.
