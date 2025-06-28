from prophet import Prophet
import pandas as pd

def forecast_expenses(transactions):
    # Convert transactions to DataFrame
    df = pd.DataFrame(transactions)
    df = df.rename(columns={'date': 'ds', 'amount': 'y'})
    
    # Train Prophet model
    model = Prophet(daily_seasonality=True)
    model.fit(df)
    
    # Predict next 30 days
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    
    return forecast[['ds', 'yhat']].tail(30).to_dict('records')