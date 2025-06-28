from prophet import Prophet
import pandas as pd
from collections import defaultdict
from datetime import datetime, timedelta

def forecast_expenses(transactions):
    """
    Forecast expenses using Prophet with better error handling
    """
    if not transactions or len(transactions) < 2:
        return {
            "totalForecast": 0.0,
            "dailyBreakdown": [],
            "byCategory": []
        }

    # Convert to DataFrame
    df = pd.DataFrame([
        {
            'ds': t['date'],
            'y': abs(t['amount']) if t['amount'] < 0 else 0,  # Only expenses
            'category': t.get('category', [])
        }
        for t in transactions
    ])

    # Filter only expenses (positive values after abs)
    df = df[df['y'] > 0]

    if df.empty or len(df) < 2:
        return {
            "totalForecast": 0.0,
            "dailyBreakdown": [],
            "byCategory": []
        }

    # Convert date column
    df['ds'] = pd.to_datetime(df['ds'])
    
    # Group by date and sum expenses
    daily_df = df.groupby('ds')['y'].sum().reset_index()

    try:
        # Create and fit Prophet model
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=False,
            interval_width=0.8
        )
        model.fit(daily_df)

        # Make forecast for next 30 days
        future = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)

        # Get future predictions only
        future_forecast = forecast.tail(30)
        total_forecast = future_forecast['yhat'].sum()

        # Create daily breakdown
        daily_breakdown = []
        for _, row in future_forecast.iterrows():
            yhat = max(0, row["yhat"])  # Ensure non-negative
            daily_breakdown.append({
                "date": row["ds"].date().isoformat(),
                "expected_spend": float(round(yhat, 2))
            })

        # Calculate category breakdown
        category_totals = defaultdict(float)
        for t in transactions:
            if t['amount'] < 0 and t.get('category'):
                for cat in t['category']:
                    category_totals[cat] += abs(t['amount'])

        total_past_spent = sum(category_totals.values())

        if total_past_spent > 0:
            by_category = [
                {
                    "category": cat,
                    "expected_spend": float(round((amt / total_past_spent) * abs(total_forecast), 2))
                }
                for cat, amt in category_totals.items()
            ]
        else:
            by_category = []

        result = {
            "totalForecast": float(round(abs(total_forecast), 2)),
            "dailyBreakdown": daily_breakdown,
            "byCategory": by_category
        }

        print("Forecast result:", result)  # Debug
        return result

    except Exception as e:
        print(f"Prophet forecast error: {e}")
        # Return fallback forecast
        avg_daily = daily_df['y'].mean()
        daily_breakdown = []
        
        for i in range(30):
            date = (datetime.now() + timedelta(days=i+1)).date().isoformat()
            daily_breakdown.append({
                "date": date,
                "expected_spend": float(round(avg_daily, 2))
            })

        return {
            "totalForecast": float(round(avg_daily * 30, 2)),
            "dailyBreakdown": daily_breakdown,
            "byCategory": []
        }
