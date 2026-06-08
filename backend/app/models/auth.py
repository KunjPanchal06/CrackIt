"""
Pydantic models for authentication-related requests and responses.
"""
from pydantic import BaseModel, Field
from typing import Optional


class UserProfile(BaseModel):
    """Response model for the current user's profile."""
    id: str = Field(..., description="Supabase user ID (UUID)")
    email: str = Field(..., description="User's email address")
    full_name: Optional[str] = Field(None, description="User's display name")
    avatar_url: Optional[str] = Field(None, description="Profile picture URL")
    provider: Optional[str] = Field(None, description="Auth provider (email, google, etc.)")
    created_at: Optional[str] = Field(None, description="Account creation timestamp")


class UpdateProfileRequest(BaseModel):
    """Request model for updating user profile."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
