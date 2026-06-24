from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

"""
CrackIt — FastAPI Backend Entry Point

This is the main application factory. It:
1. Creates the FastAPI app instance
2. Configures CORS for frontend communication
3. Registers all feature routers (added incrementally per phase)
4. Provides a health check endpoint
"""

app = FastAPI(
    title="CrackIt API",
    description="AI-powered resume tailoring platform — backend API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ---------- CORS Configuration ----------
# Allow the frontend to make cross-origin requests to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Health Check ----------
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Returns the API status and version.
    Used by deployment platforms (Render) to verify the app is running.
    """
    return {
        "status": "healthy",
        "version": "0.1.0",
        "app": "CrackIt",
    }


# ---------- Router Registration ----------
from app.routers import auth, resume, tailor

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(resume.router, prefix="/api/v1/resumes", tags=["Resumes"])
app.include_router(tailor.router, prefix="/api/v1/tailor", tags=["AI Tailoring"])

from app.routers import ats, application
# from app.routers import dashboard
app.include_router(ats.router, prefix="/api/v1/ats", tags=["ATS Scoring"])
app.include_router(application.router, prefix="/api/v1/applications", tags=["Application Tracker"])
