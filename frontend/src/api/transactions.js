import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000' // Match your FastAPI backend
});

export const getTransactions = () => api.get('/plaid/transactions');

export const categorizeTransactions = (transactions) =>
  api.post('/categorize', transactions);
