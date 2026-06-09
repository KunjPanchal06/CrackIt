import os
from dotenv import load_dotenv
from supabase import create_client
from jose import jwt, jwk

# Load env variables
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path)

supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

# Initialize client
supabase = create_client(supabase_url, supabase_service_key)

# Get JWKS key dict
jwks_keys = [{'alg': 'ES256', 'crv': 'P-256', 'ext': True, 'key_ops': ['verify'], 'kid': '5d79b3c7-4b2c-4320-9733-767158b77447', 'kty': 'EC', 'use': 'sig', 'x': 'jJd8vdvyde0qjTezlS-IpKXotQ24PhMUa0q5zD-zt2Y', 'y': 'cZfOmjKsI39I3FWZyjwBo_MVniyXgeYVWAlaUUnZ1VE'}]

# Create test user
email = "test_user_antigravity@example.com"
password = "SuperSecurePassword123!"
res = supabase.auth.sign_in_with_password({"email": email, "password": password})
token = res.session.access_token

# Let's decode
header = jwt.get_unverified_header(token)
kid = header.get("kid")

# Find key in JWKS
key_dict = None
for k in jwks_keys:
    if k["kid"] == kid:
        key_dict = k
        break

if key_dict:
    # Construct jwk
    public_key = jwk.construct(key_dict)
    
    # Try decoding
    try:
        # Note: we pass the public_key object or its PEM representation
        payload = jwt.decode(
            token,
            public_key.to_dict(), # python-jose decode takes key as dict, key object, or pem
            algorithms=["ES256"],
            audience="authenticated"
        )
        print("Verification SUCCESS:", payload)
    except Exception as e:
        print("Verification FAILED:", e)
else:
    print("No key found matching kid", kid)
