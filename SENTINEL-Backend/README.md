# Sentinel Backend

Sentinel is an execution intelligence engine that extracts and tracks hidden commitments from communication tools like Slack and Gmail using Gemini and Groq AI.

## Tech Stack
- **Framework:** FastAPI
- **Database:** Supabase (PostgreSQL)
- **AI/LLM:** Gemini API / Groq
- **Auth:** Custom JWT + OAuth 2.0 (Google, GitHub, Slack)
- **Inference:** AMD ROCm / Lamini (Optional)

## Prerequisites
- Python 3.10+
- Pip (Python Package Manager)
- A Supabase Project
- Google/GitHub/Slack Developer Credentials

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd SENTINEL-Backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *Note: Open `.env` and fill in your Supabase, OAuth, and API credentials.*

## Running the Server

Start the development server with live reload:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. You can access the Swagger UI documentation at `http://localhost:8000/docs` (disabled in production).
