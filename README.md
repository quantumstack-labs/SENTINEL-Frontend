<!-- markdownlint-disable MD041 -->
<p align="center">
  <img src="https://img.shields.io/badge/Sentinel-Execution%20Intelligence-1E3A5F?style=for-the-badge&logo=radar&logoColor=%234A90D9" alt="Sentinel - Execution Intelligence">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Stack-FastAPI%20%2B%20React-blue?style=flat-square" alt="Tech Stack">
</p>

<h1 align="center">
  <strong>Sentinel</strong><br/>
  <span style="font-size: 0.6em; font-weight: 400; color: #6B7A8F;">Execution Intelligence Platform</span>
</h1>

<p align="center">
  Sentinel transforms complex project data into an interactive, immersive "Glass Command" experience. It extracts and tracks hidden commitments from communication tools like Slack and Gmail using Gemini and Groq AI.
</p>

---

## ✨ Key Features

| Feature | Description |
|:--------|:------------|
| 🧊 **Glass Command Dashboard** | Edge-to-edge, ultra-premium interface with high-contrast glass effects, dynamic blurs, and sophisticated micro-animations |
| 🌅 **Morning Brief** | Daily situational awareness - surfaces critical updates, risks, and progress summaries |
| 🌌 **Immersive Dependency Graph** | Full-page interactive network visualization with Zen Pan Mode and precision zoom |
| 💊 **Operational Health Pill** | Scroll-aware navigation companion that intelligently hides/focuses |
| 🔔 **Smart Alerts** | Real-time identification of project blockers and risks |
| 🔗 **Integrations** | Seamless connections to Slack, Gmail, GitHub, Jira, and more |
ZM|
## 📹 Demo Video

https://github.com/user/repo/blob/main/docs/assets/SENTINEL.mp4

---

## 🖼️ Screenshots

### Dashboard
![Dashboard](docs/assets/Dashboard.png)

### Dependency Graph
![Dependency Graph](docs/assets/Dependency%20Graph%20Page.png)

### Commitments
![Commitments](docs/assets/Commitment%20Page.png)

### Integrations
![Integrations](docs/assets/Integration%20Page.png)
---

## 🛠️ Technology Stack

### Frontend
<div>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/Framer_Motion-12-DD34FB?style=for-the-badge&logo=framer" alt="Framer Motion">
</div>

### Backend
<div>
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Supabase-3-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase">
  <img name="Google%20Gemini" src="https://img.shields.io/badge/Gemini_AI-1.5-8AB4F8?style=for-the-badge&logo=google" alt="Gemini AI">
  <img src="https://img.shields.io/badge/Groq-LLM-F0218B?style=for-the-badge" alt="Groq">
</div>

---

## 🚀 Quick Start

### Prerequisites

- **Frontend**: Node.js (v18+), npm or yarn
- **Backend**: Python 3.10+, pip

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/sentinel.git
cd sentinel
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd SENTINEL-Frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Start development server
npm run dev
```

The frontend runs at `http://localhost:3000`

### 3. Backend Setup

```bash
# Navigate to backend
cd SENTINEL-Backend

# Create virtual environment
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase, OAuth, and API credentials

# Start development server
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`

> 📚 API Documentation available at `http://localhost:8000/docs`

---

## 📁 Project Structure

```
SENTINEL/
├── SENTINEL-Frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   └── lib/                # Utilities
│   └── index.html
│
├── SENTINEL-Backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/                # API endpoints
│   │   ├── services/           # Business logic
│   │   ├── models/             # Data models
│   │   ├── integrations/       # External integrations
│   │   └── db/                 # Database utilities
HJ|├── docs/                        # Documentation & assets
│   └── assets/                     # Images & videos
│
└── README.md                       # This file
```

---

## ⚙️ Environment Variables

### Frontend (`.env`)

| Variable | Description |
|:---------|:------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_GEMINI_API_KEY` | Gemini API key for AI features |

### Backend (`.env`)

| Variable | Description |
|:---------|:------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GROQ_API_KEY` | Groq API key |
| `JWT_SECRET` | Secret for JWT token signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `SLACK_CLIENT_ID` | Slack OAuth client ID |
| `SLACK_CLIENT_SECRET` | Slack OAuth client secret |

---

## 🎨 Design Philosophy

Sentinel adheres to the **Zenith of Beauty** principle — where form meets function with absolute clarity. Every interaction is designed to feel physical, every blur is mathematically balanced for readability, and every animation serves to provide immediate system status.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

BN|  <p>Built with ❤️ by the Sentinel Intelligence Team</p>
    <a href="https://github.com/your-org/sentinel/issues">Issues</a> •
    <a href="https://github.com/your-org/sentinel/discussions">Discussions</a> •
    <a href="https://github.com/your-org/sentinel">Repository</a>
  </p>
</div>
