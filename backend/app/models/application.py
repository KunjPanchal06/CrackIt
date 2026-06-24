"""
Application Tracker — Pydantic request/response models.

Maps to the `public.applications` table in Supabase:
  - id (UUID, auto-generated)
  - user_id (UUID, from JWT)
  - company (TEXT, required)
  - role (TEXT, required)
  - status (TEXT, enum: saved/applied/interviewing/offer/rejected)
  - applied_date (DATE)
  - salary_range (TEXT, nullable)
  - job_url (TEXT, nullable)
  - notes (TEXT, nullable)
  - resume_id (UUID, nullable — FK to resumes)
  - created_at, updated_at (TIMESTAMPTZ)
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date


APPLICATION_STATUSES = ("saved", "applied", "interviewing", "offer", "rejected")
StatusType = Literal["saved", "applied", "interviewing", "offer", "rejected"]


class CreateApplicationRequest(BaseModel):
    """Request model for creating a new application."""
    company: str = Field(..., min_length=1, max_length=200, description="Company name")
    role: str = Field(..., min_length=1, max_length=300, description="Job role/title")
    status: StatusType = Field(default="saved", description="Application status")
    applied_date: Optional[str] = Field(None, description="Applied date (YYYY-MM-DD)")
    salary_range: Optional[str] = Field(None, max_length=100, description="e.g. $120k–$150k")
    job_url: Optional[str] = Field(None, max_length=2000, description="Link to the job posting")
    notes: Optional[str] = Field(None, max_length=5000, description="Personal notes")
    resume_id: Optional[str] = Field(None, description="UUID of the linked resume from the vault")


class UpdateApplicationRequest(BaseModel):
    """Request model for partially updating an application."""
    company: Optional[str] = Field(None, min_length=1, max_length=200)
    role: Optional[str] = Field(None, min_length=1, max_length=300)
    status: Optional[StatusType] = None
    applied_date: Optional[str] = None
    salary_range: Optional[str] = Field(None, max_length=100)
    job_url: Optional[str] = Field(None, max_length=2000)
    notes: Optional[str] = Field(None, max_length=5000)
    resume_id: Optional[str] = None


class UpdateStatusRequest(BaseModel):
    """Request model for updating only the status (used by drag-and-drop)."""
    status: StatusType


class ApplicationResponse(BaseModel):
    """Full application response model."""
    id: str
    user_id: str
    company: str
    role: str
    status: str
    applied_date: Optional[str] = None
    salary_range: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    resume_id: Optional[str] = None
    resume_title: Optional[str] = None  # Joined from resumes table
    created_at: str
    updated_at: str


class ApplicationListItem(BaseModel):
    """Lightweight response for list/kanban views."""
    id: str
    company: str
    role: str
    status: str
    applied_date: Optional[str] = None
    salary_range: Optional[str] = None
    job_url: Optional[str] = None
    resume_id: Optional[str] = None
    resume_title: Optional[str] = None
    created_at: str
    updated_at: str


class ApplicationStats(BaseModel):
    """Aggregate statistics for the stats bar."""
    total: int = 0
    saved: int = 0
    applied: int = 0
    interviewing: int = 0
    offer: int = 0
    rejected: int = 0
    response_rate: float = 0.0  # Percentage
