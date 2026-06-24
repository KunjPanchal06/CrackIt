"""
Dashboard Service — aggregates data from multiple tables for the dashboard.

Pulls from: resumes, applications, tailored_resumes
Returns a single summary object with all stats + recent activity.
"""
from app.services.supabase_service import get_admin_client


def get_dashboard_summary(user_id: str) -> dict:
    """
    Fetch all dashboard data in a single call.

    Returns:
      - resume_count: total resumes in the vault
      - application_count: total tracked applications
      - avg_ats_score: average ATS score across tailored resumes (or null)
      - response_rate: (interviewing + offer) / (applied + interviewing + offer + rejected)
      - applications_by_status: { saved, applied, interviewing, offer, rejected }
      - recent_applications: last 5 applications (company, role, status, updated_at)
      - recent_resumes: last 5 resumes (id, title, updated_at)
    """
    client = get_admin_client()

    # --- Resume count ---
    resumes_resp = (
        client.table("resumes")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .execute()
    )
    resume_count = resumes_resp.count or 0

    # --- Recent resumes (last 5) ---
    recent_resumes_resp = (
        client.table("resumes")
        .select("id, title, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .limit(5)
        .execute()
    )
    recent_resumes = recent_resumes_resp.data or []

    # --- All application statuses (for counts + rate) ---
    apps_resp = (
        client.table("applications")
        .select("status")
        .eq("user_id", user_id)
        .execute()
    )
    app_list = apps_resp.data or []

    status_counts = {
        "saved": 0,
        "applied": 0,
        "interviewing": 0,
        "offer": 0,
        "rejected": 0,
    }
    for app in app_list:
        s = app.get("status", "saved")
        if s in status_counts:
            status_counts[s] += 1

    application_count = len(app_list)

    # Response rate
    denom = (
        status_counts["applied"]
        + status_counts["interviewing"]
        + status_counts["offer"]
        + status_counts["rejected"]
    )
    if denom > 0:
        response_rate = round(
            ((status_counts["interviewing"] + status_counts["offer"]) / denom) * 100, 1
        )
    else:
        response_rate = 0.0

    # --- Recent applications (last 5) ---
    recent_apps_resp = (
        client.table("applications")
        .select("id, company, role, status, applied_date, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .limit(5)
        .execute()
    )
    recent_applications = recent_apps_resp.data or []

    # --- Avg ATS score from tailored_resumes ---
    ats_resp = (
        client.table("tailored_resumes")
        .select("ats_score")
        .eq("user_id", user_id)
        .not_.is_("ats_score", "null")
        .execute()
    )
    ats_scores = [r["ats_score"] for r in (ats_resp.data or []) if r.get("ats_score")]
    avg_ats_score = round(sum(ats_scores) / len(ats_scores), 1) if ats_scores else None

    return {
        "resume_count": resume_count,
        "application_count": application_count,
        "avg_ats_score": avg_ats_score,
        "response_rate": response_rate,
        "applications_by_status": status_counts,
        "recent_applications": recent_applications,
        "recent_resumes": recent_resumes,
    }
