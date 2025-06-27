// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const listener = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}
