"""
Application Tracker Router — CRUD + status update + stats endpoints.

Endpoints:
  - GET    /              → List all applications for the current user
  - GET    /stats         → Get aggregate stats (total, per-status, response rate)
  - POST   /              → Create a new application
  - GET    /{id}          → Get a single application
  - PATCH  /{id}          → Update an application (partial)
  - PATCH  /{id}/status   → Update only the status (for Kanban drag-drop)
  - DELETE /{id}          → Delete an application
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.middleware.auth import get_current_user
from app.models.application import (
    CreateApplicationRequest,
    UpdateApplicationRequest,
    UpdateStatusRequest,
    ApplicationResponse,
    ApplicationListItem,
    ApplicationStats,
)
from app.models.auth import MessageResponse
from app.services import application_service

router = APIRouter()


@router.get("/", response_model=List[ApplicationListItem])
async def list_applications(current_user: dict = Depends(get_current_user)):
    """
    Get all applications for the authenticated user.
    Returns lightweight data sorted by most recently updated.
    """
    user_id = current_user.get("sub")
    applications = application_service.list_applications(user_id)
    return applications


@router.get("/stats", response_model=ApplicationStats)
async def get_stats(current_user: dict = Depends(get_current_user)):
    """
    Get aggregate statistics for the stats bar.
    """
    user_id = current_user.get("sub")
    stats = application_service.get_application_stats(user_id)
    return stats


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    body: CreateApplicationRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new application with the given details.
    """
    user_id = current_user.get("sub")

    try:
        application = application_service.create_application(
            user_id=user_id,
            data=body.model_dump(exclude_none=True),
        )
        return application
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create application: {str(e)}",
        )


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Get a single application by ID.
    Only returns the application if it belongs to the authenticated user.
    """
    user_id = current_user.get("sub")
    application = application_service.get_application(application_id, user_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    return application


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    body: UpdateApplicationRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Partially update an application. Only provided fields are changed.
    """
    user_id = current_user.get("sub")

    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided.",
        )

    application = application_service.update_application(
        application_id=application_id,
        user_id=user_id,
        data=update_data,
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    return application


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_status(
    application_id: str,
    body: UpdateStatusRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Update only the application status.
    Optimized for Kanban drag-and-drop operations.
    """
    user_id = current_user.get("sub")

    application = application_service.update_application_status(
        application_id=application_id,
        user_id=user_id,
        status=body.status,
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    return application


@router.delete("/{application_id}", response_model=MessageResponse)
async def delete_application(
    application_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete an application by ID.
    """
    user_id = current_user.get("sub")
    deleted = application_service.delete_application(application_id, user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    return MessageResponse(message="Application deleted successfully.")
