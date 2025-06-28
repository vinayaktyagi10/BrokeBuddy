from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.utils.auth_utils import get_current_user
from app.services.forecast_service import forecast_expenses

router = APIRouter()

@router.post("/")
async def create_forecast(
    transactions: List[Dict[str, Any]],
    current_user: dict = Depends(get_current_user)
):
    try:
        print(f"Received {len(transactions)} transactions for forecast")
        forecast_data = forecast_expenses(transactions)
        return forecast_data
    except Exception as e:
        print(f"Forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")
