"""
AI Tailor Router — endpoint for AI-powered resume tailoring.

Endpoints:
  - POST /                → Tailor a resume to match a job description using Groq AI
  - POST /compile-preview → Compile tailored LaTeX to PDF for preview (without saving)
"""
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_current_user
from app.models.tailor import TailorRequest, TailorResponse, CompilePreviewRequest
from app.models.resume import CompileResponse
from app.services import resume_service
from app.services.groq_service import tailor_resume
from app.services.latex_service import compile_and_upload

router = APIRouter()


@router.post("/", response_model=TailorResponse)
async def tailor_resume_endpoint(
    body: TailorRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Tailor a resume's LaTeX code to match a job description using AI.

    Flow:
    1. Fetch the user's original resume from the database
    2. Send the LaTeX + JD to Groq (Llama 3.3 70B) for tailoring
    3. Return the tailored LaTeX code

    The frontend handles saving (as new resume or replacing original).
    """
    user_id = current_user.get("sub")

    # Fetch the original resume
    resume = resume_service.get_resume(body.resume_id, user_id)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    # Call Groq AI to tailor the resume
    success, tailored_latex, error = tailor_resume(
        latex_code=resume["latex_code"],
        job_description=body.job_description,
    )

    if not success:
        return TailorResponse(
            success=False,
            error=error,
            original_resume_id=body.resume_id,
            original_title=resume["title"],
        )

    return TailorResponse(
        success=True,
        tailored_latex=tailored_latex,
        original_resume_id=body.resume_id,
        original_title=resume["title"],
    )


@router.post("/compile-preview", response_model=CompileResponse)
async def compile_preview(
    body: CompilePreviewRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Compile tailored LaTeX to PDF for preview purposes.
    Uses a temporary ID so the PDF isn't linked to any saved resume.
    """
    user_id = current_user.get("sub")
    preview_id = f"preview-{uuid4().hex[:8]}"

    success, pdf_url, error = compile_and_upload(
        latex_code=body.latex_code,
        user_id=user_id,
        resume_id=preview_id,
    )

    if not success:
        return CompileResponse(success=False, error=error)

    return CompileResponse(success=True, pdf_url=pdf_url)
