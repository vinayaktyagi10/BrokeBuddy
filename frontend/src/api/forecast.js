import axios from 'axios';

const api = axios.create({ 
  baseURL: 'http://localhost:8000',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

// Get actual transactions first, then forecast
export const getForecast = async () => {
  try {
    // Get transactions
    const txRes = await api.get('/transactions');
    
    // Send to forecast
    const forecastRes = await api.post('/forecast/', txRes.data);
    return forecastRes.data;
  } catch (error) {
    console.error('Forecast error:', error);
    throw error;
  }
};

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
