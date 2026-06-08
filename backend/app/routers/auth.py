"""
Authentication Router — endpoints for user profile management.

Note: Actual sign-up/sign-in is handled client-side via Supabase Auth.
This router provides server-side endpoints that require an authenticated
JWT, such as:
  - GET  /me      → Get current user profile
  - PATCH /me     → Update profile (display name)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.models.auth import UserProfile, UpdateProfileRequest, MessageResponse
from app.services.supabase_service import get_admin_client

router = APIRouter()


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    Decodes user info from the JWT payload.
    """
    user_metadata = current_user.get("user_metadata", {})
    app_metadata = current_user.get("app_metadata", {})

    return UserProfile(
        id=current_user.get("sub", ""),
        email=current_user.get("email", ""),
        full_name=user_metadata.get("full_name") or user_metadata.get("name"),
        avatar_url=user_metadata.get("avatar_url") or user_metadata.get("picture"),
        provider=app_metadata.get("provider", "email"),
        created_at=current_user.get("created_at"),
    )


@router.patch("/me", response_model=MessageResponse)
async def update_profile(
    body: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Update the current user's profile.
    Uses the Supabase admin client to update user metadata.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not determine user ID from token.",
        )

    try:
        admin = get_admin_client()
        update_data = {}

        if body.full_name is not None:
            update_data["data"] = {"full_name": body.full_name}

        if update_data:
            admin.auth.admin.update_user_by_id(user_id, update_data)

        return MessageResponse(message="Profile updated successfully.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}",
        )
