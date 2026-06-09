"""
Pydantic models for Resume-related requests and responses.

Maps to the `public.resumes` table in Supabase:
  - id (UUID, auto-generated)
  - user_id (UUID, from JWT)
  - title (TEXT)
  - latex_code (TEXT)
  - pdf_url (TEXT, nullable — set after compilation)
  - created_at, updated_at (TIMESTAMPTZ)
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CreateResumeRequest(BaseModel):
    """Request model for creating a new resume."""
    title: str = Field(
        default="Untitled Resume",
        min_length=1,
        max_length=200,
        description="Resume title (e.g., 'Software Engineer Resume')",
    )
    latex_code: str = Field(
        ...,
        min_length=1,
        description="LaTeX source code for the resume",
    )


class UpdateResumeRequest(BaseModel):
    """Request model for updating an existing resume (partial update)."""
    title: Optional[str] = Field(
        None, min_length=1, max_length=200,
        description="New title for the resume",
    )
    latex_code: Optional[str] = Field(
        None, min_length=1,
        description="Updated LaTeX source code",
    )


class ResumeResponse(BaseModel):
    """Response model for a single resume."""
    id: str = Field(..., description="Resume UUID")
    user_id: str = Field(..., description="Owner's user UUID")
    title: str = Field(..., description="Resume title")
    latex_code: str = Field(..., description="LaTeX source code")
    pdf_url: Optional[str] = Field(None, description="URL to compiled PDF in Supabase Storage")
    created_at: str = Field(..., description="Creation timestamp (ISO 8601)")
    updated_at: str = Field(..., description="Last update timestamp (ISO 8601)")


class ResumeListItem(BaseModel):
    """Lightweight response model for resume list views (no latex_code)."""
    id: str
    title: str
    pdf_url: Optional[str] = None
    created_at: str
    updated_at: str


class CompileResponse(BaseModel):
    """Response model after LaTeX compilation."""
    success: bool
    pdf_url: Optional[str] = Field(None, description="URL of the generated PDF")
    error: Optional[str] = Field(None, description="Compilation error message, if any")
