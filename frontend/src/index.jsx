import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  headers: {
    // If you’re using auth, insert the token dynamically
    // Otherwise remove this line
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`
  }
});

export default api;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
