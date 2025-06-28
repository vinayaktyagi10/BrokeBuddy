import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/retro.css';
import ChatWindow from '../components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import ForecastChart from '../components/ForecastChart';

export default function Dashboard() {
  const navigate = useNavigate();

  const [chatHistory, setChatHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [forecast, setForecast] = useState([]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAction = async (type) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Not logged in');

    try {
      switch (type) {
        case 'ADVICE':
          setShowChat(true);
          const firstMsg = {
            role: 'user',
            content: 'Give me advice on managing money as a college student',
          };

          const adviceRes = await axios.post(
            'http://localhost:8000/advice',
            { messages: [firstMsg] },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const reply = adviceRes.data.response || adviceRes.data.message || 'No advice returned.';
          setChatHistory([
            { role: 'user', content: firstMsg.content },
            { role: 'assistant', content: reply },
          ]);
          break;

        case 'FORECAST':
          const forecastRes = await axios.post(
            'http://localhost:8000/forecast',
            {}, // you can pass user data if needed
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          setForecast(forecastRes.data);
          break;

        case 'RISK':
          alert('Risk analysis coming soon...');
          break;

        case 'TRANSACTIONS':
          const txRes = await axios.get('http://localhost:8000/transactions', {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert(`You have ${txRes.data.length} transactions.`);
          break;

        default:
          alert('Unknown action');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong: ' + (err.response?.data?.detail || err.message));
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
          <button className="action-btn" onClick={() => handleAction('TRANSACTIONS')}>GET<br />TRANSACTION HISTORY</button>
        </div>

        {showChat && (
          <ChatWindow
            onClose={() => setShowChat(false)}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        )}

        {forecast.length > 0 && (
          <div>
            <h2>30-Day Expense Forecast</h2>
            <ForecastChart forecastData={forecast} />
          </div>
        )}
      </main>

      <footer className="footer">
        © 2025 BROKEBUDDY FINANCIAL ORACLE. ALL RIGHTS RESERVED.
      </footer>
    </>
  );
}
