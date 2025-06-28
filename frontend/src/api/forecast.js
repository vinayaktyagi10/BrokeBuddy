import axios from 'axios';

// No /api if you registered routes directly in main.py
const api = axios.create({ baseURL: 'http://localhost:8000' });

// Dummy transactions – replace this with actual state or backend call
const mockTransactions = [
  { date: "2025-06-01", name: "Zomato", amount: -300, category: ["Food"] },
  { date: "2025-06-02", name: "Spotify", amount: -199, category: ["Entertainment"] },
  { date: "2025-06-03", name: "Uber", amount: -350, category: ["Transport"] },
];

// POST to /forecast with transactions
export const getForecast = async () => {
  const res = await api.post('/forecast', mockTransactions);
  return res.data;
};

// POST to /advice with forecast data as a message (optional: improve prompt later)
export const getRisk = async () => {
  const res = await api.post('/advice', {
    messages: [
      {
        role: "user",
        content: "Given my forecasted expenses, what financial risks do you see? Suggest actions."
      }
    ]
  });
  return res.data;
};
