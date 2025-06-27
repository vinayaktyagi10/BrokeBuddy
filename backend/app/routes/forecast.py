from fastapi import APIRouter

router = APIRouter()

@router.get("/forecast")
def get_forecast():
    return [{"month": "June", "spend": 14000}, {"month": "July", "spend": 15500}]

@router.get("/risk")
def get_risk():
    return {
        "message": "You're on track to overspend ₹5,000 this month",
        "suggestion": "Try pausing subscriptions or reduce Zomato orders"
    }
