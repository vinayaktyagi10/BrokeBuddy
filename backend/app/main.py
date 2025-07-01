from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import List
from app.routes import auth, advice, forecast, plaid
from app.utils.auth_utils import get_current_user
from app.schemas.forecast import Transaction
import os

# --- FastAPI App Initialization ---
app = FastAPI(
    title="BrokeBuddy Backend",
    description="AI + Plaid Powered Finance Advice API"
)

# --- CORS Setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(advice.router, prefix="", tags=["Advice"])
app.include_router(forecast.router, prefix="/forecast", tags=["Forecast"])
app.include_router(plaid.router, prefix="/plaid", tags=["Plaid"])

# --- OAuth2 Setup ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ✅ Keep only the transactions endpoint here (remove duplicate advice endpoint)
@app.get("/transactions", response_model=List[Transaction])
def get_transactions(user: dict = Depends(get_current_user)):
    return [
        {
            "date": "2025-06-01",
            "name": "Coffee",
            "amount": -120,
            "category": ["Food & Drink"]
        },
        {
            "date": "2025-06-02",
            "name": "Salary",
            "amount": 15000,
            "category": ["Income"]
        },
        {
            "date": "2025-06-03",
            "name": "Uber",
            "amount": -350,
            "category": ["Transport"]
        }
    ]

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.post("/debug/auth")
async def debug_auth_endpoint(request: Request):
    """Debug endpoint to check what headers and tokens are being sent"""
    
    # Get all headers
    headers = dict(request.headers)
    
    # Try to extract token from different places
    auth_header = headers.get("authorization", "")
    bearer_token = ""
    
    if auth_header.startswith("Bearer "):
        bearer_token = auth_header[7:]  # Remove "Bearer " prefix
    
    # Check token structure
    token_info = {
        "has_auth_header": bool(auth_header),
        "auth_header_value": auth_header[:50] + "..." if auth_header else None,
        "bearer_token_length": len(bearer_token) if bearer_token else 0,
        "token_parts": len(bearer_token.split(".")) if bearer_token else 0,
        "token_preview": bearer_token[:50] + "..." if bearer_token else None
    }
    
    # Try to decode if it looks like a JWT
    jwt_info = {"valid": False, "error": None}
    if bearer_token and len(bearer_token.split(".")) == 3:
        try:
            from jose import jwt
            SECRET_KEY = os.getenv("JWT_SECRET_KEY")
            
            if SECRET_KEY:
                payload = jwt.decode(bearer_token, SECRET_KEY, algorithms=["HS256"])
                jwt_info = {"valid": True, "payload": payload}
            else:
                jwt_info = {"valid": False, "error": "No SECRET_KEY found"}
        except Exception as e:
            jwt_info = {"valid": False, "error": str(e)}
    
    return {
        "message": "Auth Debug Info",
        "headers": {k: v for k, v in headers.items() if k.lower() in ['authorization', 'content-type', 'user-agent']},
        "token_info": token_info,
        "jwt_info": jwt_info,
        "environment": {
            "has_secret_key": bool(os.getenv("JWT_SECRET_KEY")),
            "secret_key_length": len(os.getenv("JWT_SECRET_KEY", ""))
        }
    }
