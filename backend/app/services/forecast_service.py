from prophet import Prophet
import pandas as pd

def forecast_expenses(transactions):
    # 🔧 Convert Pydantic models to dicts
    transactions = [t.dict() if hasattr(t, "dict") else t for t in transactions]

    # ✅ Now create DataFrame safely
    df = pd.DataFrame(transactions)

    # 🔍 Confirm required columns exist
    if 'amount' not in df.columns or 'date' not in df.columns:
        raise ValueError("Missing 'amount' or 'date' in input data.")

    df = df.rename(columns={'date': 'ds', 'amount': 'y'})

    # Filter only expenses (negative amounts)
    df = df[df['y'] < 0]

    # Convert string to datetime
    df['ds'] = pd.to_datetime(df['ds'])

    # Group by day to get total spend per day
    df = df.groupby('ds').sum().reset_index()

    if df.empty or len(df) < 2:
        return {
            "totalForecast": 0.0,
            "dailyBreakdown": [],
            "byCategory": []  # still required by schema
        }

    # Fit Prophet model
    model = Prophet(daily_seasonality=True)
    model.fit(df)

    # Forecast next 30 days
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    total_forecast = forecast['yhat'].tail(30).sum()

    daily_breakdown = [
        {
            "date": row["ds"].date().isoformat(),
            "expected_spend": round(row["yhat"], 2)
        }
        for _, row in forecast.tail(30).iterrows()
    ]

    return {
        "totalForecast": round(total_forecast, 2),
        "dailyBreakdown": daily_breakdown,
        "byCategory": []  # Placeholder
    }
