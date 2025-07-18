# db.py
from supabase import create_client, Client
import os

# Load your Service Role key from an environment variable
SUPABASE_URL = "https://dchelwrfqsmzfgnfcmxs.supabase.co"
SERVICE_ROLE_KEY =("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjaGVsd3JmcXNtemZnbmZjbXhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc5MjQzMSwiZXhwIjoyMDY4MzY4NDMxfQ.23ROtFYuEOCYqdzjuOcNFVlQuEsSq20jmUuUfmfuOSk")


supabase: Client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

def reset_user_password(user_id: str, new_password: str):
    res = supabase.auth.admin.update_user_by_id(
        user_id,
        { "password": new_password }
    )
    if getattr(res,"error",None):
        raise RuntimeError(f"Failed to reset password: {res['error']['message']}")
    return {"status": "ok", "user_id": user_id}
