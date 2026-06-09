"""
Pydantic models for AI Resume Tailoring requests and responses.
"""
from pydantic import BaseModel, Field
from typing import Optional


class TailorRequest(BaseModel):
    """Request body for tailoring a resume to a job description."""
    resume_id: str = Field(..., description="UUID of the resume to tailor")
    job_description: str = Field(
        ...,
        min_length=50,
        description="The job description text to tailor the resume for",
    )


class TailorResponse(BaseModel):
    """Response from the tailoring endpoint."""
    success: bool
    tailored_latex: Optional[str] = None
    error: Optional[str] = None
    original_resume_id: str
    original_title: str


class CompilePreviewRequest(BaseModel):
    """Request body for compiling a preview of tailored LaTeX."""
    latex_code: str = Field(..., min_length=10, description="LaTeX code to compile")
