import logging

logger = logging.getLogger("uvicorn.error")



from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel,HttpUrl
from datetime import date

from db import supabase
from reset import reset_user_password

app = FastAPI()
security = HTTPBearer()
logger = logging.getLogger("uvicorn.error")

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


class ProofRequest(BaseModel):
    url: str


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

def get_current_user_id():
    res = supabase.auth.get_user()
    if res:
        user = getattr(res,"user",None)
        return getattr(user,"id",None)


# --- Role endpoint ---

@app.get("/auth/role")
def get_user_role(user_id = Depends(get_current_user_id)):
    

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
    if user_id:
        payload = {
            "listing_id": req.listing_id,
            "claimant_id": user_id,
            "status": "pending"
        }
        res = supabase.table("claims").insert(payload).execute()


@app.get("/admin/claims")
def all_claims():
    """
    Returns all claims (any status). Front‑end will filter as needed.
    """
    return supabase.from_("view_all_claims").select("*").execute()

@app.post("/admin/claims/{claim_id}/status")
def update_claim(claim_id: str, status: str):
    return supabase.rpc("fn_update_claim_status", {
        "p_claim_id": claim_id,
        "p_new_status": status
    }).execute()

@app.post("/admin/claims/{claim_id}/proof")
def attach_proof(
    claim_id: str,
    req: ProofRequest,
    admin_id: str = Depends(get_current_user_id)
):
    # 1) run the RPC
    res = supabase.rpc("fn_attach_identity_proof", {
        "p_claim_id": claim_id,
        "p_admin_id": admin_id,
        "p_url": req.url
    }).execute()

    # 2) check for errors
    if getattr(res, "error", None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.error.message or "Failed to attach proof"
        )

    # 3) return a simple serializable response
    return {"success": True}




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


@app.get("/users/{user_id}")
def get_user_by_id(user_id: str):
    """
    Returns the profile for ANY user (admin or member),
    using our existing fn_get_profile RPC.
    """
    res = supabase.rpc("fn_get_profile", {"uid": user_id}).execute()
    # res.data will be a list of 0 or 1 rows

    return res.data[0]



@app.get("/account/data")
def get_account_data(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials  # the raw JWT string

    # Ask Supabase Auth who this token belongs to
    res = supabase.auth.get_user(token)




    if res:
        user = getattr(res,"user")
        user_id= getattr(user,"id")
        prof_res = supabase.rpc("fn_get_profile", {"uid": user_id}).execute()
        logger.debug("   fn_get_profile response: %r", prof_res)

        listings_res = (
            supabase
            .from_("view_listings_by_member")
            .select("*")
            .eq("reported_by", user_id)
            .execute()
        )
        logger.debug("   view_listings_by_member returned %d rows", len(listings_res.data or []))

        requests_res = (
            supabase
            .from_("view_member_requests")
            .select("*")
            .eq("claimant_id", user_id)
            .execute()
        )
        logger.debug("   view_member_requests returned %d rows", len(requests_res.data or []))

        payload = {
            "profile": prof_res,
            "listings": listings_res.data,
            "requests": requests_res.data
        }
        logger.debug("   Responding with keys: %s", list(payload.keys()))

        return payload
    return {"message":"user not ofound"}

    # main.py (add near your other endpoints)

@app.get("/listings/{listing_id}")
def get_listing(listing_id: str, user_id: str = Depends(get_current_user_id)):
    """
    Returns a single listing row (with image_url, title, etc.)
    """
    res = (
        supabase
        .from_("view_open_listings")         # or view_listings_by_member/admin depending
        .select("*")
        .eq("listing_id", listing_id)
        .single()
        .execute()
    )
    if getattr(res,"data")=={}:
        raise HTTPException(status_code=404, detail="Listing not found")
    return res.data



class ListingCreate(BaseModel):
    title: str
    description: str
    listing_type: str
    event_date: date | None = None
    location: str | None = None
    category_id: int | None = None
    brand: str | None = None
    color: str | None = None
    notes: str | None = None
    image_url: str

@app.post("/listings")
def create_listing(
    data: ListingCreate,
    creds: HTTPAuthorizationCredentials = Depends(security)
):
    token = creds.credentials  # the raw JWT string

    # Ask Supabase Auth who this token belongs to
    res = supabase.auth.get_user(token)
    user = getattr(res,"user")
    user_id= getattr(user,"id")

    # prepare insert payload
    payload = dict(data)
    image_url = payload.pop("image_url")

    # 3) insert into listings
    payload["reported_by"] = user_id

    if payload.get("event_date") is not None:
        payload["event_date"] = payload["event_date"].isoformat()

    payload["reported_by"] = user_id

    lst = supabase.table("listings").insert(payload).execute()



    listing_id = lst.data[0]["listing_id"]

    # 4) now insert into listing_images

    img = supabase.table("listing_images").insert({
        "listing_id": listing_id,
        "image_url": image_url
    }).execute()


    # 5) return the new ID
    return {"listing_id": listing_id}