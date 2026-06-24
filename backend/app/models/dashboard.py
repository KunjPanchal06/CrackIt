"""
Dashboard — Pydantic response models.
"""
from pydantic import BaseModel
from typing import Optional


class RecentApplication(BaseModel):
    """Lightweight application data for the activity feed."""
    id: str
    company: str
    role: str
    status: str
    applied_date: Optional[str] = None
    updated_at: str


class RecentResume(BaseModel):
    """Lightweight resume data for the activity feed."""
    id: str
    title: str
    updated_at: str


class ApplicationsByStatus(BaseModel):
    """Breakdown of application counts per status."""
    saved: int = 0
    applied: int = 0
    interviewing: int = 0
    offer: int = 0
    rejected: int = 0


class DashboardSummary(BaseModel):
    """Complete dashboard response combining all stats and recent activity."""
    resume_count: int = 0
    application_count: int = 0
    avg_ats_score: Optional[float] = None
    response_rate: float = 0.0
    applications_by_status: ApplicationsByStatus
    recent_applications: list[RecentApplication] = []
    recent_resumes: list[RecentResume] = []
