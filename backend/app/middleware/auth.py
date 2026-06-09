"""
JWT Authentication Middleware — verifies Supabase JWTs.

Supports both symmetric (HS256) and asymmetric (ES256, RS256) tokens
by fetching public keys dynamically from the Supabase JWKS endpoint.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt, jwk
import httpx
from app.config import settings

# Security scheme — looks for "Authorization: Bearer <token>" header
security = HTTPBearer()

# Global cache for JWKS keys
_jwks_keys = []


def fetch_jwks() -> list:
    """Fetch JSON Web Key Set from Supabase auth server."""
    global _jwks_keys
    if not settings.supabase_url:
        return []

    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    try:
        response = httpx.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            _jwks_keys = data.get("keys", [])
            return _jwks_keys
    except Exception as e:
        print(f"Error fetching JWKS from {url}: {e}")
    return _jwks_keys


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency that validates the Supabase JWT.
    Supports HS256, RS256, and ES256 dynamically.
    """
    token = credentials.credentials

    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        kid = header.get("kid")

        # 1. HS256 Symmetrical Verification
        if alg == "HS256":
            if not settings.supabase_jwt_secret:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="JWT secret not configured on the server.",
                )
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload

        # 2. Asymmetric Verification (ES256, RS256, etc.) using JWKS
        else:
            global _jwks_keys
            # Check cache first
            key_dict = next((k for k in _jwks_keys if k.get("kid") == kid), None)

            # If not cached, refetch JWKS
            if not key_dict:
                keys = fetch_jwks()
                key_dict = next((k for k in keys if k.get("kid") == kid), None)

            if not key_dict:
                raise JWTError(f"No matching key found in JWKS for kid: {kid}")

            public_key = jwk.construct(key_dict)
            payload = jwt.decode(
                token,
                public_key.to_dict(),
                algorithms=[alg],
                audience="authenticated",
            )
            return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
