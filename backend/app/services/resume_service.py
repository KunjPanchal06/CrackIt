"""
Resume Service — database operations for the resumes table.

All functions use the Supabase admin client (bypasses RLS).
The `user_id` filter is always applied to ensure data isolation
between users, even though RLS is also configured as a safety net.
"""
from typing import Optional
from app.services.supabase_service import get_admin_client


def list_resumes(user_id: str) -> list[dict]:
    """
    Get all resumes for a user, ordered by most recently updated.
    Returns lightweight data (no latex_code) for list views.
    """
    client = get_admin_client()
    response = (
        client.table("resumes")
        .select("id, title, pdf_url, created_at, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return response.data


def get_resume(resume_id: str, user_id: str) -> Optional[dict]:
    """
    Get a single resume by ID, including full latex_code.
    Returns None if not found or not owned by user.
    """
    client = get_admin_client()
    response = (
        client.table("resumes")
        .select("*")
        .eq("id", resume_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    return response.data


def create_resume(user_id: str, title: str, latex_code: str) -> dict:
    """
    Create a new resume for a user.
    Returns the created resume record.
    """
    client = get_admin_client()
    response = (
        client.table("resumes")
        .insert({
            "user_id": user_id,
            "title": title,
            "latex_code": latex_code,
        })
        .execute()
    )
    return response.data[0]


def update_resume(
    resume_id: str,
    user_id: str,
    title: Optional[str] = None,
    latex_code: Optional[str] = None,
) -> Optional[dict]:
    """
    Partially update a resume. Only provided fields are updated.
    Returns the updated resume, or None if not found.
    """
    client = get_admin_client()

    update_data = {"updated_at": "now()"}
    if title is not None:
        update_data["title"] = title
    if latex_code is not None:
        update_data["latex_code"] = latex_code

    response = (
        client.table("resumes")
        .update(update_data)
        .eq("id", resume_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0] if response.data else None


def delete_resume(resume_id: str, user_id: str) -> bool:
    """
    Delete a resume by ID.
    Returns True if a row was deleted, False otherwise.
    """
    client = get_admin_client()
    response = (
        client.table("resumes")
        .delete()
        .eq("id", resume_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(response.data) > 0


def update_resume_pdf_url(resume_id: str, user_id: str, pdf_url: str) -> Optional[dict]:
    """
    Set the pdf_url after successful LaTeX compilation.
    """
    client = get_admin_client()
    response = (
        client.table("resumes")
        .update({"pdf_url": pdf_url, "updated_at": "now()"})
        .eq("id", resume_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data[0] if response.data else None
