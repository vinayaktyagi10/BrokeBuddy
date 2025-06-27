from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Dict
import httpx
from app.routes.auth import get_current_user  # JWT user auth
from app.schemas.advice import ChatRequest

router = APIRouter()
OLLAMA_URL = "http://localhost:11434/api/chat"

# Fake bank context for demo
BANK_CONTEXT = """
You are BrokeBuddy, a Gen Z-friendly financial coach.
Your role is to analyze bank transactions and give helpful, casual, and friendly money advice.

The following is a demo user's transaction history with some bank-like categories:
- 2025-06-01: ₹240 at Starbucks (category: Food & Drink)
- 2025-06-02: ₹15000 Salary (category: Income)
- 2025-06-03: ₹899 Zomato (category: Food & Drink)
- 2025-06-04: ₹120 Netflix (category: Subscriptions)
- 2025-06-05: ₹700 Uber (category: Transport)
- 2025-06-06: ₹3000 Zara (category: Shopping)

Keep replies short (2–4 lines), witty, and casual. Always act like a friend, not a formal advisor.
"""

@router.post("/advice")
async def chat_with_llama(
    messages: List[Dict[str, str]],
    user: dict = Depends(get_current_user)
):
    full_messages = [{"role": "system", "content": BANK_CONTEXT}] + messages
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(OLLAMA_URL, json={
                "model": "llama3",
                "messages": full_messages,
                "stream": False
            })
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

        return response.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
