import os
from plaid.api import plaid_api
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
from plaid import Environment  # Import Environment directly
from datetime import datetime, timedelta
import json

# Initialize Plaid client
plaid_env = os.getenv('PLAID_ENV', 'sandbox').lower()
if plaid_env == 'sandbox':
    host = Environment.Sandbox
elif plaid_env == 'development':
    host = Environment.Development
elif plaid_env == 'production':
    host = Environment.Production
else:
    host = Environment.Sandbox  # default fallback

configuration = Configuration(
    host=host,
    api_key={
        'clientId': os.getenv('PLAID_CLIENT_ID'),
        'secret': os.getenv('PLAID_SECRET'),
    }
)
api_client = ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)

def exchange_public_token(public_token: str):
    """Exchange public token for access token"""
    try:
        request = ItemPublicTokenExchangeRequest(
            public_token=public_token
        )
        response = client.item_public_token_exchange(request)
        return {
            "access_token": response['access_token'],
            "item_id": response['item_id']
        }
    except Exception as e:
        print(f"Error exchanging token: {e}")
        raise Exception(f"Failed to exchange token: {str(e)}")

def get_accounts(access_token: str):
    """Get user's bank accounts"""
    try:
        request = AccountsGetRequest(access_token=access_token)
        response = client.accounts_get(request)
        
        accounts = []
        for account in response['accounts']:
            accounts.append({
                "account_id": account['account_id'],
                "name": account['name'],
                "type": account['type'],
                "subtype": account['subtype'],
                "balance": account['balances']['current']
            })
        return accounts
    except Exception as e:
        print(f"Error getting accounts: {e}")
        raise Exception(f"Failed to get accounts: {str(e)}")

def get_transactions(access_token: str, days_back: int = 365):
    """Get transactions from the last N days"""
    try:
        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days_back)
        
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date
        )
        
        response = client.transactions_get(request)
        transactions = []
        
        for transaction in response['transactions']:
            # Format transaction data
            formatted_transaction = {
                "transaction_id": transaction['transaction_id'],
                "account_id": transaction['account_id'],
                "amount": transaction['amount'],  # Positive = money out, Negative = money in
                "date": transaction['date'].isoformat(),
                "name": transaction['name'],
                "merchant_name": transaction.get('merchant_name'),
                "category": transaction.get('category', []),
                "account_owner": transaction.get('account_owner')
            }
            transactions.append(formatted_transaction)
        
        return {
            "transactions": transactions,
            "total_transactions": response['total_transactions']
        }
        
    except Exception as e:
        print(f"Error getting transactions: {e}")
        raise Exception(f"Failed to get transactions: {str(e)}")
