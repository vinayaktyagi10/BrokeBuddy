from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.utils.auth_utils import get_current_user
from app.services.plaid_service import exchange_public_token, get_accounts, get_transactions
import os

router = APIRouter()

class PublicTokenRequest(BaseModel):
    public_token: str

class TransactionRequest(BaseModel):
    days_back: int = 365

@router.get("/link-token")
async def create_link_token(current_user: dict = Depends(get_current_user)):
    """Create a link token for Plaid Link initialization"""
    from plaid.model.link_token_create_request import LinkTokenCreateRequest
    from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
    from plaid.model.country_code import CountryCode
    from plaid.model.products import Products
    from app.services.plaid_service import client
    
    try:
        request = LinkTokenCreateRequest(
            products=[Products.transactions],  # Fixed: Use Products.transactions
            client_name="BrokeBuddy Finance App",
            country_codes=[CountryCode.US],  # Fixed: Use CountryCode.US
            language='en',
            user=LinkTokenCreateRequestUser(client_user_id=str(current_user['user_id']))
        )
        
        response = client.link_token_create(request)
        return {"link_token": response['link_token']}
        
    except Exception as e:
        print(f"Error creating link token: {e}")
        raise HTTPException(status_code=500, detail="Failed to create link token")

@router.post("/exchange-token")
async def exchange_token(
    token_request: PublicTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    """Exchange public token for access token and save to user"""
    try:
        result = exchange_public_token(token_request.public_token)
        
        # TODO: Save access_token to user in database (encrypted!)
        # For now, we'll return it (NOT SECURE - just for demo)
        return {
            "message": "Bank account connected successfully!",
            "access_token": result["access_token"]  # Remove this in production
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/accounts")
async def get_user_accounts(current_user: dict = Depends(get_current_user)):
    """Get user's connected bank accounts"""
    # TODO: Get access_token from database
    # For demo, we'll expect it to be passed or stored temporarily
    access_token = "YOUR_ACCESS_TOKEN_FROM_DB"  # Replace with actual DB lookup
    
    try:
        accounts = get_accounts(access_token)
        return {"accounts": accounts}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/transactions")
async def get_user_transactions(
    request: TransactionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Get user's transaction history"""
    # TODO: Get access_token from database
    access_token = "YOUR_ACCESS_TOKEN_FROM_DB"  # Replace with actual DB lookup
    
    try:
        result = get_transactions(access_token, request.days_back)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
