import sys
from jose import jwt, JWTError
from supabase import create_client

# Read backend .env variables
import os
from dotenv import load_dotenv

# Load from backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path)

supabase_url = os.getenv("SUPABASE_URL")
supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

print("URL:", supabase_url)
print("JWT Secret length:", len(supabase_jwt_secret) if supabase_jwt_secret else 0)

# Let's try to sign in a test user if possible, or just generate a dummy token and decode it
try:
    # Let's check if we can decode a dummy token to see what algorithms are supported
    token = jwt.encode({"sub": "test", "aud": "authenticated"}, "secret", algorithm="HS256")
    header = jwt.get_unverified_header(token)
    print("Dummy HS256 header:", header)
    
    decoded = jwt.decode(token, "secret", algorithms=["HS256"], audience="authenticated")
    print("Dummy HS256 decode success:", decoded)
except Exception as e:
    print("Error with dummy HS256:", e)

try:
    # Let's check if we can decode a token with ES256
    # Note: signing ES256 requires a private key, so we just check if the algorithm is supported
    print("Supported algorithms in python-jose might be checked here.")
except Exception as e:
    print(e)
