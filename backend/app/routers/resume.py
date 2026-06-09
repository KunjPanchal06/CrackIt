"""
Resume Router — CRUD endpoints + LaTeX compilation.

Endpoints:
  - GET    /              → List all resumes for the current user
  - POST   /              → Create a new resume
  - GET    /{resume_id}   → Get a single resume (with full LaTeX code)
  - PATCH  /{resume_id}   → Update a resume (title and/or LaTeX code)
  - DELETE /{resume_id}   → Delete a resume
  - POST   /{resume_id}/compile → Compile LaTeX to PDF and store result
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.middleware.auth import get_current_user
from app.models.resume import (
    CreateResumeRequest,
    UpdateResumeRequest,
    ResumeResponse,
    ResumeListItem,
    CompileResponse,
)
from app.models.auth import MessageResponse
from app.services import resume_service
from app.services.latex_service import compile_and_upload

router = APIRouter()


@router.get("/", response_model=List[ResumeListItem])
async def list_resumes(current_user: dict = Depends(get_current_user)):
    """
    Get all resumes for the authenticated user.
    Returns lightweight data (no latex_code) sorted by most recently updated.
    """
    user_id = current_user.get("sub")
    resumes = resume_service.list_resumes(user_id)
    return resumes


@router.post("/", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    body: CreateResumeRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new resume with the given title and LaTeX code.
    """
    user_id = current_user.get("sub")

    try:
        resume = resume_service.create_resume(
            user_id=user_id,
            title=body.title,
            latex_code=body.latex_code,
        )
        return resume
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create resume: {str(e)}",
        )


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Get a single resume by ID, including full LaTeX source code.
    Only returns the resume if it belongs to the authenticated user.
    """
    user_id = current_user.get("sub")
    resume = resume_service.get_resume(resume_id, user_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    return resume


@router.patch("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    body: UpdateResumeRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Partially update a resume. Only provided fields are changed.
    """
    user_id = current_user.get("sub")

    # Ensure at least one field is being updated
    if body.title is None and body.latex_code is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field (title or latex_code) must be provided.",
        )

    resume = resume_service.update_resume(
        resume_id=resume_id,
        user_id=user_id,
        title=body.title,
        latex_code=body.latex_code,
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    return resume


@router.delete("/{resume_id}", response_model=MessageResponse)
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a resume by ID.
    Also removes the compiled PDF from storage if it exists.
    """
    user_id = current_user.get("sub")
    deleted = resume_service.delete_resume(resume_id, user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    return MessageResponse(message="Resume deleted successfully.")


@router.post("/{resume_id}/compile", response_model=CompileResponse)
async def compile_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Compile the resume's LaTeX code to PDF using Tectonic.
    Uploads the resulting PDF to Supabase Storage and updates the pdf_url.
    """
    user_id = current_user.get("sub")

    # Fetch the resume
    resume = resume_service.get_resume(resume_id, user_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    # Compile and upload
    success, pdf_url, error = compile_and_upload(
        latex_code=resume["latex_code"],
        user_id=user_id,
        resume_id=resume_id,
    )

    if not success:
        return CompileResponse(success=False, error=error)

    # Update the resume record with the new PDF URL
    resume_service.update_resume_pdf_url(resume_id, user_id, pdf_url)

    return CompileResponse(success=True, pdf_url=pdf_url)
