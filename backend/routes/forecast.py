from fastapi import APIRouter
from services.forecast_service import forecast_expenses

router = APIRouter()

@router.post("/forecast")
async def get_forecast(transactions: list):
    return forecast_expenses(transactions)