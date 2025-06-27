from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from app.routes.auth import get_current_user
from app.services.plaid_service import plaid_client
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from app.db.database import cursor, conn

router = APIRouter()

@router.post("/token_exchange")
def exchange_token(
    public_token: str,
    user: dict = Depends(get_current_user)
):
    try:
        # Exchange token with Plaid
        request = ItemPublicTokenExchangeRequest(public_token=public_token)
        response = plaid_client.item_public_token_exchange(request)
        access_token = response["access_token"]

        # Save to database
        cursor.execute(
            "UPDATE users SET plaid_access_token = ? WHERE username = ?",
            (access_token, user["username"])
        )
        conn.commit()

        return {"msg": "Plaid token exchanged and saved."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transactions")
def get_transactions(user: dict = Depends(get_current_user)):
    # Retrieve access token from DB
    cursor.execute(
        "SELECT plaid_access_token FROM users WHERE username = ?",
        (user["username"],)
    )
    row = cursor.fetchone()
    if not row or not row[0]:
        raise HTTPException(status_code=400, detail="Plaid token not linked.")
    
    access_token = row[0]

    try:
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')

        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date
        )
        response = plaid_client.transactions_get(request)
        return response["transactions"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
