import React from 'react';
import '../styles/retro.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAction = async (type) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not logged in');

    try {
      let response;
      switch (type) {
        case 'ADVICE':
          response = await axios.get('http://localhost:8000/advice', {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert(`Advice: ${response.data.message}`);
          break;

        case 'FORECAST':
          alert('Forecast feature coming soon...');
          break;

        case 'RISK':
          alert('Risk analysis coming soon...');
          break;

        case 'TRANSACTIONS':
          response = await axios.get('http://localhost:8000/transactions', {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert(`You have ${response.data.length} transactions.`);
          break;

        default:
          alert('Unknown action');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  return (
    <>
      <header className="header">
        <div className="app-name">BROKEBUDDY</div>
        <button className="logout-btn" onClick={logout}>LOGOUT</button>
      </header>

      <main className="main-content">
        <h1 className="welcome-text">WHAT DO YOU WANNA KNOW TODAY?</h1>

        <div className="action-grid">
          <button className="action-btn" onClick={() => handleAction('ADVICE')}>GENERATE<br />ADVICE</button>
          <button className="action-btn" onClick={() => handleAction('FORECAST')}>GET<br />FORECAST</button>
          <button className="action-btn" onClick={() => handleAction('RISK')}>GET<br />RISK</button>
          <button className="action-btn" onClick={() => handleAction('TRANSACTIONS')}>GET TRANSACTION<br />HISTORY</button>
        </div>
      </main>

      <footer className="footer">
        © 2025 BROKEBUDDY FINANCIAL ORACLE. ALL RIGHTS RESERVED.
      </footer>
    </>
  );
}
