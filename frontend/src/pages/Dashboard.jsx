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
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchForecast = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoadingForecast(true);
      const res = await axios.post(
        'http://localhost:8000/forecast',
	null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setForecast(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load forecast: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingForecast(false);
    }
  };

  useEffect(() => {
    fetchForecast(); // fetch on load
  }, []);

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
          fetchForecast(); // also allow button to refresh
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

        {loadingForecast && (
          <div className="text-center text-lg font-medium mt-8">Loading forecast...</div>
        )}

        {forecast && forecast.dailyBreakdown?.length > 0 && (
          <div className="mt-8">
            <div className="text-center text-xl font-bold mb-2">
              Total Forecasted Spend: ₹{forecast.totalForecast}
            </div>
            <ForecastChart forecastData={forecast.dailyBreakdown} />
          </div>
        )}
      </main>

      <footer className="footer">
        © 2025 BROKEBUDDY FINANCIAL ORACLE. ALL RIGHTS RESERVED.
      </footer>
    </>
  );
}
