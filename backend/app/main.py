from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List

# --- FastAPI App Initialization ---
app = FastAPI(title="BrokeBuddy Backend", description="AI + Plaid Powered Finance Advice API")

# --- CORS Setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OAuth2 Setup (JWT-based auth) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- Dummy Auth Dependency ---
def get_current_user(token: str = Depends(oauth2_scheme)):
    # Here you would decode JWT and fetch user info from DB
    return {"username": "test_user"}  # For demo purposes

# --- Advice Endpoint ---
@app.get("/advice")
def get_advice(user: dict = Depends(get_current_user)):
    return {
        "username": user["username"],
        "message": "Try saving 20% of your income this month!"
    }

# --- Transactions Endpoint (Placeholder for Plaid) ---
class Transaction(BaseModel):
    id: int
    description: str
    amount: float

@app.get("/transactions", response_model=List[Transaction])
def get_transactions(user: dict = Depends(get_current_user)):
    # This is where you'd fetch real transactions from Plaid for the logged-in user
    return [
        {"id": 1, "description": "Coffee", "amount": -120},
        {"id": 2, "description": "Salary", "amount": 15000},
        {"id": 3, "description": "Uber", "amount": -350}
    ]
