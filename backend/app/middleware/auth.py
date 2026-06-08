"""
JWT Authentication Middleware — verifies Supabase JWTs.

This module provides a FastAPI dependency that:
1. Extracts the Bearer token from the Authorization header
2. Decodes and validates the JWT using the Supabase JWT secret
3. Returns the decoded payload (user info) for route handlers

Usage in a router:
    @router.get("/protected")
    async def protected_route(current_user: dict = Depends(get_current_user)):
        return {"user_id": current_user["sub"]}
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.config import settings

# Security scheme — looks for "Authorization: Bearer <token>" header
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency that validates the Supabase JWT.
    Returns the decoded token payload containing user info.

    Raises HTTPException 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials

    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT secret not configured on the server.",
        )

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            # Supabase tokens use 'authenticated' as the audience
            audience="authenticated",
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
