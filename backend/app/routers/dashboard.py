"""
Dashboard Router — single endpoint that returns all dashboard data.

Endpoints:
  - GET /summary → Aggregate stats + recent activity
"""
from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.models.dashboard import DashboardSummary
from app.services import dashboard_service

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    """
    Get the complete dashboard summary for the authenticated user.
    Aggregates data from resumes, applications, and tailored_resumes.
    """
    user_id = current_user.get("sub")
    summary = dashboard_service.get_dashboard_summary(user_id)
    return summary
