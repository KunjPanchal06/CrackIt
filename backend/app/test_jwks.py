import httpx
import os
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path)

supabase_url = os.getenv("SUPABASE_URL")
url = f"{supabase_url}/auth/v1/.well-known/jwks.json"

try:
    r = httpx.get(url)
    print("JWKS Status:", r.status_code)
    print("JWKS Body:", r.json())
except Exception as e:
    print("JWKS Error:", e)
