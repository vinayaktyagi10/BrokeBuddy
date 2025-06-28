from fastapi import APIRouter, Depends
from typing import List
from app.schemas.forecast import Transaction, ForecastResponse
from app.services.forecast_service import forecast_expenses
from app.utils.auth_utils import get_current_user

router = APIRouter()

@router.post("/", response_model=ForecastResponse)
async def get_forecast(
    transactions: List[Transaction],
    user: dict = Depends(get_current_user)  # ✅ Optional: remove if not using auth yet
):
    return forecast_expenses(transactions)
