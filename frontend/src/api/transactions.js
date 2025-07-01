import axios from 'axios';

const api = axios.create({
  baseURL: 'http://35.222.231.180' // Match your FastAPI backend
});

export const getTransactions = () => api.get('/plaid/transactions');

export const categorizeTransactions = (transactions) =>
  api.post('/categorize', transactions);
