from fastapi import FastAPI, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional

from app.routes import auth, advice  # ✅ Import your routers

# --- FastAPI App Initialization ---
app = FastAPI(
    title="BrokeBuddy Backend",
    description="AI + Plaid Powered Finance Advice API"
)

# --- CORS Setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include Routers AFTER creating `app`
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(advice.router, prefix="", tags=["Advice"])

# --- OAuth2 Setup ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- Dummy Auth Dependency ---
def get_current_user(token: str = Depends(oauth2_scheme)):
    return {"username": "test_user"}

# --- Advice Endpoint (optional: can be removed if advice router handles it) ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/advice")
async def chat_with_llama(
    chat: ChatRequest = Body(...),
    user: dict = Depends(get_current_user)
):
    full_messages = [{"role": "system", "content": "You're BrokeBuddy, a Gen Z money coach. Be casual."}] + [
        msg.dict() for msg in chat.messages
    ]

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post("http://localhost:11434/api/chat", json={
                "model": "llama3",
                "messages": full_messages,
                "stream": False
            })
        return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class Transaction(BaseModel):
    date: str
    name: str
    amount: float
    category: Optional[List[str]] = []


    
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
