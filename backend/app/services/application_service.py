"""
Application Service — database operations for the applications table.

All functions use the Supabase admin client (bypasses RLS).
The `user_id` filter is always applied to ensure data isolation
between users, even though RLS is also configured as a safety net.

Note: The applications table now includes `resume_id` (FK to resumes)
and `job_url` columns. If these columns don't exist yet, run the
migration SQL in supabase_schema.sql.
"""
from typing import Optional
from app.services.supabase_service import get_admin_client


def list_applications(user_id: str) -> list[dict]:
    """
    Get all applications for a user, ordered by most recently updated.
    Joins with the resumes table to get the linked resume's title.
    """
    client = get_admin_client()
    response = (
        client.table("applications")
        .select("*, resumes(title)")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )

    # Flatten the joined resume title
    results = []
    for app in response.data:
        resume_data = app.pop("resumes", None)
        app["resume_title"] = resume_data["title"] if resume_data else None
        results.append(app)

    return results


def get_application(application_id: str, user_id: str) -> Optional[dict]:
    """
    Get a single application by ID.
    Returns None if not found or not owned by user.
    """
    client = get_admin_client()
    response = (
        client.table("applications")
        .select("*, resumes(title)")
        .eq("id", application_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    if not response.data:
        return None

    app = response.data
    resume_data = app.pop("resumes", None)
    app["resume_title"] = resume_data["title"] if resume_data else None
    return app


def create_application(user_id: str, data: dict) -> dict:
    """
    Create a new application for a user.
    Returns the created application record.
    """
    client = get_admin_client()

    insert_data = {
        "user_id": user_id,
        "company": data["company"],
        "role": data["role"],
        "status": data.get("status", "saved"),
    }

    # Optional fields
    if data.get("applied_date"):
        insert_data["applied_date"] = data["applied_date"]
    if data.get("salary_range"):
        insert_data["salary_range"] = data["salary_range"]
    if data.get("job_url"):
        insert_data["job_url"] = data["job_url"]
    if data.get("notes"):
        insert_data["notes"] = data["notes"]
    if data.get("resume_id"):
        insert_data["resume_id"] = data["resume_id"]

    response = (
        client.table("applications")
        .insert(insert_data)
        .execute()
    )

    # Fetch with join to return resume_title
    created = response.data[0]
    return get_application(created["id"], user_id) or created


def update_application(
    application_id: str,
    user_id: str,
    data: dict,
) -> Optional[dict]:
    """
    Partially update an application. Only provided fields are updated.
    Returns the updated application, or None if not found.
    """
    client = get_admin_client()

    update_data = {"updated_at": "now()"}
    for field in ("company", "role", "status", "applied_date",
                  "salary_range", "job_url", "notes", "resume_id"):
        if field in data and data[field] is not None:
            update_data[field] = data[field]

    response = (
        client.table("applications")
        .update(update_data)
        .eq("id", application_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        return None

    # Re-fetch with join
    return get_application(application_id, user_id)


def update_application_status(
    application_id: str,
    user_id: str,
    status: str,
) -> Optional[dict]:
    """
    Update only the status of an application.
    Used by the Kanban drag-and-drop to be fast.
    """
    client = get_admin_client()
    response = (
        client.table("applications")
        .update({"status": status, "updated_at": "now()"})
        .eq("id", application_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        return None

    return get_application(application_id, user_id)


def delete_application(application_id: str, user_id: str) -> bool:
    """
    Delete an application by ID.
    Returns True if a row was deleted, False otherwise.
    """
    client = get_admin_client()
    response = (
        client.table("applications")
        .delete()
        .eq("id", application_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(response.data) > 0


def get_application_stats(user_id: str) -> dict:
    """
    Calculate aggregate statistics for the stats bar.
    Returns counts per status + response rate.
    """
    client = get_admin_client()
    response = (
        client.table("applications")
        .select("status")
        .eq("user_id", user_id)
        .execute()
    )

    counts = {
        "total": 0,
        "saved": 0,
        "applied": 0,
        "interviewing": 0,
        "offer": 0,
        "rejected": 0,
    }

    for app in response.data:
        status = app.get("status", "saved")
        counts["total"] += 1
        if status in counts:
            counts[status] += 1

    # Response rate = (interviewing + offer) / (applied + interviewing + offer + rejected)
    denominator = counts["applied"] + counts["interviewing"] + counts["offer"] + counts["rejected"]
    if denominator > 0:
        counts["response_rate"] = round(
            ((counts["interviewing"] + counts["offer"]) / denominator) * 100, 1
        )
    else:
        counts["response_rate"] = 0.0

    return counts
