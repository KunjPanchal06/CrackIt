"""
Supabase Admin Service — server-side Supabase client.

Uses the service role key (NOT the anon key) to perform
privileged operations like reading user profiles, managing
storage, etc. This client bypasses Row Level Security.

NEVER expose the service role key to the frontend.
"""
from supabase import create_client, Client
from app.config import settings


def get_supabase_admin() -> Client:
    """
    Create and return a Supabase admin client.
    Uses the service role key for server-side operations.
    """
    if not settings.supabase_url or not settings.supabase_service_key:
        raise RuntimeError(
            "Supabase credentials not configured. "
            "Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"
        )

    return create_client(settings.supabase_url, settings.supabase_service_key)


# Singleton admin client — import this throughout the backend
# Lazy initialization to avoid errors when env vars aren't set
_admin_client: Client | None = None


def get_admin_client() -> Client:
    """Get the singleton Supabase admin client (lazy init)."""
    global _admin_client
    if _admin_client is None:
        _admin_client = get_supabase_admin()
    return _admin_client
