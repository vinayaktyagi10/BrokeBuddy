from fastapi import FastAPI
from app.routes import plaid, advice, auth

app = FastAPI(title="BrokeBuddy API")

# Route Registrations
app.include_router(plaid.router, prefix="/plaid")
app.include_router(advice.router, prefix="/advice")
app.include_router(auth.router, prefix="/auth")

@app.get("/health")
def health_check():
    return {"status": "ok"}
