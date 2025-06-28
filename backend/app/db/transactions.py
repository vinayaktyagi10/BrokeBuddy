# Dummy fallback
def get_transactions_for_user(user_id: int):
    return [
        {"date": "2025-06-01", "name": "Coffee", "amount": -120, "category": ["Food & Drink"]},
        {"date": "2025-06-02", "name": "Uber", "amount": -350, "category": ["Transport"]},
        {"date": "2025-06-03", "name": "Subway", "amount": -200, "category": ["Food & Drink"]},
        {"date": "2025-06-04", "name": "Book", "amount": -500, "category": ["Education"]}
    ]
