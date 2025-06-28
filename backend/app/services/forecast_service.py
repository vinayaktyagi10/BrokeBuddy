from prophet import Prophet
import pandas as pd
from collections import defaultdict

def forecast_expenses(transactions):
    df = pd.DataFrame(transactions)
    df = df.rename(columns={'date': 'ds', 'amount': 'y'})

    # Filter only expenses
    df = df[df['y'] < 0]

    if df.empty or len(df) < 2:
        return {
            "totalForecast": 0.0,
            "dailyBreakdown": [],
            "byCategory": []
        }

    df['ds'] = pd.to_datetime(df['ds'])
    daily_df = df.groupby('ds').sum().reset_index()

    model = Prophet(daily_seasonality=True)
    model.fit(daily_df)

    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    total_forecast = forecast['yhat'].tail(30).sum()

    daily_breakdown = []
    for _, row in forecast.tail(30).iterrows():
        yhat = row["yhat"]
        if pd.isna(yhat):
            continue
        daily_breakdown.append({
            "date": row["ds"].date().isoformat(),
            "expected_spend": float(round(yhat, 2))
        })

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
                "expected_spend": float(round((amt / total_past_spent) * total_forecast, 2))
            }
            for cat, amt in category_totals.items()
        ]
    else:
        by_category = []

    result = {
        "totalForecast": float(round(total_forecast, 2)),
        "dailyBreakdown": daily_breakdown,
        "byCategory": by_category
    }

    print("Returning forecast:", result)  # Debug ✅
    return result
