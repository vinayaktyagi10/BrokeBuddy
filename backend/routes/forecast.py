from fastapi import APIRouter, Depends
from app.schemas.forecast import ForecastResponse
from app.services.forecast_service import forecast_expenses
from app.utils.auth_utils import get_current_user
from app.schemas.user import User  # ✅ make sure this is imported
from app.db.transactions import get_transactions_for_user  # ✅ implement this below

router = APIRouter()

@router.post("/forecast", response_model=ForecastResponse)
def get_forecast(user: User = Depends(get_current_user)):
    transactions = get_transactions_for_user(user.id)  # 🔁 actual DB query
    return forecast_expenses(transactions)
