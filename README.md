# CrackIt — AI-Powered Resume Tailoring Platform

> Paste a job description. Let AI rewrite your LaTeX resume to match.  
> Optimize for ATS scores. Land more interviews.

---

## 🚀 Tech Stack

### Frontend
- **React + Vite** — Fast, modern UI framework
- **Tailwind CSS v4** — Utility-first styling
- **shadcn/ui** — Accessible UI components
- **React Router v6** — Client-side routing
- **Monaco Editor** — LaTeX code editing (VS Code's editor)
- **Zustand** — Lightweight global state management
- **react-pdf** — PDF preview rendering
- **Axios** — HTTP client with interceptors

### Backend
- **Python + FastAPI** — High-performance async API
- **Supabase** — PostgreSQL database + Auth + Storage
- **Groq API** — Llama 3.3 70B (tailoring) + Llama 3.1 8B (ATS scoring)
- **Tectonic** — LaTeX to PDF compilation
- **ARQ + Upstash Redis** — Async job queue
- **PyMuPDF + python-docx** — Document parsing
- **Pydantic** — Request/response validation

---

## 📦 Project Structure

```
CrackIt/
├── frontend/                  (React + Vite app)
│   ├── src/
│   │   ├── components/        (reusable UI components)
│   │   │   ├── auth/          (AuthGuard, OAuthButton)
│   │   │   ├── layout/        (Sidebar, Navbar, AppLayout)
│   │   │   └── ui/            (shadcn/ui components)
│   │   ├── pages/             (one file per route/page)
│   │   ├── store/             (Zustand global state)
│   │   ├── hooks/             (custom React hooks)
│   │   ├── lib/               (axios instance, supabase client, helpers)
│   │   └── main.jsx
│   ├── .env.example
│   └── vite.config.js
│
├── backend/                   (FastAPI app)
│   ├── app/
│   │   ├── routers/           (auth, resume, jd, tailor, ats, application, dashboard)
│   │   ├── services/          (groq_service, supabase_service, latex_service)
│   │   ├── models/            (Pydantic request/response models)
│   │   ├── middleware/        (JWT auth verification)
│   │   ├── workers/           (ARQ async job workers)
│   │   ├── config.py          (Pydantic Settings — env vars)
│   │   └── main.py            (FastAPI app entry point)
│   ├── .env.example
│   └── requirements.txt
│
└── README.md
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js** >= 18
- **Python** >= 3.10
- **npm** (comes with Node.js)
- Accounts: Supabase, Groq, Upstash

### 1. Clone the repository
```bash
git clone https://github.com/KunjPanchal06/CrackIt.git
cd CrackIt
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env          # Fill in your Supabase credentials
npm install
npm run dev                   # Starts on http://localhost:5173
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate         # On Windows
# source venv/bin/activate    # On Mac/Linux
pip install -r requirements.txt
cp .env.example .env          # Fill in all API keys
uvicorn app.main:app --reload --port 8000
```

---

## 🔑 Environment Variables

### Frontend (`.env`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_API_BASE_URL` | Backend API URL (optional in dev) |

### Backend (`.env`)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret |
| `GROQ_API_KEY` | Groq API key |
| `REDIS_URL` | Upstash Redis URL |
| `APP_ENV` | `development` or `production` |
| `CORS_ORIGINS` | Allowed frontend origins |

---

## 📋 Features

- [x] Project scaffolding
- [x] User authentication (Supabase Auth)
- [x] Resume vault (LaTeX editor + PDF preview)
- [ ] Job description intake (paste or upload)
- [ ] AI resume tailoring (Groq / Llama 3.3)
- [ ] ATS score & analysis
- [ ] PDF export (Tectonic)
- [ ] Version history
- [ ] Application tracker
- [ ] Dashboard
- [ ] Deployment

---

## 📄 License

MIT © Kunj Panchal
