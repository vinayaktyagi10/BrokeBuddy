from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Dict
import httpx
from app.routes.auth import get_current_user  # ✅ Import the auth dependency

router = APIRouter()
OLLAMA_URL = "http://localhost:11434/api/generate"

@router.post("/advice")
async def generate_advice(
    transactions: List[Dict] = Body(...),
    user: dict = Depends(get_current_user)  # ✅ Require JWT-authenticated user
):
    try:
        txn_str = "\n".join(
            f"- {t['date']}: ₹{t['amount']} on {t['name']} ({', '.join(t.get('category', []))})"
            for t in transactions
        )

        prompt = (
            "You are BrokeBuddy, a helpful Gen Z finance coach.\n"
            "Your job is to analyze recent transactions and give a single, friendly money tip.\n"
            "Be casual, positive, and keep it short.\n"
            f"Transactions:\n{txn_str}\n\n"
            "Advice:"
        )

        async with httpx.AsyncClient() as client:
            response = await client.post(OLLAMA_URL, json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            })

        if response.status_code != 200:
            print("❌ Ollama response error:", response.status_code, response.text)
            raise HTTPException(status_code=500, detail="Ollama model error")

        data = response.json()
        return {"advice": data["response"].strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
