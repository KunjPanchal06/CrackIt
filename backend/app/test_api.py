import os
import httpx
from dotenv import load_dotenv
from supabase import create_client

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path)

supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

# Initialize client
supabase = create_client(supabase_url, supabase_service_key)

try:
    email = "test_user_antigravity@example.com"
    password = "SuperSecurePassword123!"
    res = supabase.auth.sign_in_with_password({"email": email, "password": password})
    token = res.session.access_token
    
    # Send request to local running backend /resumes/
    headers = {"Authorization": f"Bearer {token}"}
    r = httpx.get("http://localhost:8000/api/v1/resumes/", headers=headers)
    print("Backend Resumes Response Status:", r.status_code)
    print("Backend Resumes Response Body:", r.text)
    
except Exception as e:
    print("Error:", e)
