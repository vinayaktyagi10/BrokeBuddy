from pydantic import BaseModel
from typing import List

class Transaction(BaseModel):
    date: str
    name: str
    amount: float
    category: List[str]

class DailyForecast(BaseModel):
    date: str
    expected_spend: float

class CategoryForecast(BaseModel):
    category: str
    expected_spend: float

class ForecastResponse(BaseModel):
    totalForecast: float
    dailyBreakdown: List[DailyForecast]
    byCategory: List[CategoryForecast]  # ✅ REQUIRED field
