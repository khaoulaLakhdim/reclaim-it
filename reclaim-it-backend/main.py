from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from db import supabase
from reset import reset_user_password

app = FastAPI()
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth models & endpoints ---

class SignupRequest(BaseModel):
    email: str
    password: str
    firstName: str | None
    lastName: str | None

class SignInRequest(BaseModel):
    email: str
    password: str

@app.post("/sign_up")
def sign_up(sign_up_data: SignupRequest):
    return supabase.auth.sign_up({
        "email": sign_up_data.email,
        "password": sign_up_data.password,
        "options": {
            "data": {
                "first_name": sign_up_data.firstName,
                "last_name": sign_up_data.lastName
            }
        }
    })

@app.post("/sign_in")
def sign_in(sign_in_data: SignInRequest):
    return supabase.auth.sign_in_with_password({
        "email": sign_in_data.email,
        "password": sign_in_data.password,
    })

@app.get("/user")
def get_user():
    return supabase.auth.get_user()

@app.get("/signout")
def sign_out():
    return supabase.auth.sign_out()


# --- Dependency to extract user ID from Bearer token ---

def get_current_user_id(
    creds: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    token = creds.credentials
    try:
        res = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = getattr(res, "user", None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user.id


# --- Role endpoint ---

@app.get("/auth/role")
def get_user_role(user_id: str = Depends(get_current_user_id)):
    try:
        resp = (
            supabase
            .from_("admin_profile")         # assuming your admin table is admin_profile
            .select("user_id")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
    except Exception:
        return {"role": "member"}

    if resp.data:
        return {"role": "admin"}
    return {"role": "member"}


# --- Listings & Profile ---

@app.get("/listings")
def list_open_listings():
    return supabase.from_("view_open_listings").select("*").execute()

@app.get("/profile")
def get_profile(user_id: str = Depends(get_current_user_id)):
    return supabase.rpc("fn_get_profile", {"uid": user_id}).execute()


# --- Claims endpoints ---

class ClaimRequest(BaseModel):
    listing_id: str

@app.post("/claims")
def create_claim(
    req: ClaimRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Direct insert into claims (bypassing RPC/policies)
    """
    return user_id
    payload = {
        "listing_id": req.listing_id,
        "claimant_id": user_id,
        "status": "pending"
    }
    res = supabase.table("claims").insert(payload).execute()
    if res.error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.error.message or "Failed to create claim"
        )
    return res.data


@app.get("/admin/claims")
def pending_claims():
    return supabase.from_("view_pending_claims").select("*").execute()

@app.post("/admin/claims/{claim_id}/status")
def update_claim(claim_id: str, status: str):
    return supabase.rpc("fn_update_claim_status", {
        "p_claim_id": claim_id,
        "p_new_status": status
    }).execute()

@app.post("/admin/claims/{claim_id}/proof")
def attach_proof(
    claim_id: str,
    url: str,
    admin_id: str = Depends(get_current_user_id)
):
    return supabase.rpc("fn_attach_identity_proof", {
        "p_claim_id": claim_id,
        "p_admin_id": admin_id,
        "p_url": url
    }).execute()


# --- Password reset (admin-only) ---

class ResetData(BaseModel):
    user_id: str
    password: str

@app.post("/reset")
def reset_user_endpoint(data: ResetData):
    try:
        return reset_user_password(data.user_id, data.password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
