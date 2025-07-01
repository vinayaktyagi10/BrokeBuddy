import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/retro.css';
import ChatWindow from '../components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import ForecastChart from '../components/ForecastChart';
import PlaidLink from '../components/PlaidLink';

export default function Dashboard() {
  const navigate = useNavigate();

  const [chatHistory, setChatHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [bankConnected, setBankConnected] = useState(false); // Track if bank is connected

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch real transactions from Plaid
  const fetchRealTransactions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoadingTransactions(true);
      const res = await axios.post(
        '/plaid/transactions',
        { days_back: 365 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      setTransactions(res.data.transactions);
      alert(`Loaded ${res.data.transactions.length} real transactions!`);
    } catch (err) {
      console.error(err);
      alert("Failed to load transactions: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Generate forecast with real transaction data
  const fetchForecastWithRealData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Check if we have real transactions
    if (transactions.length === 0) {
      alert('Please connect your bank and fetch transaction history first!');
      return;
    }

    try {
      setLoadingForecast(true);
      const res = await axios.post(
        '/forecast/',
        transactions, // Use real transactions instead of dummy data
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
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

  // Fallback forecast with dummy data (for demo purposes)
  const fetchForecast = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoadingForecast(true);
      const res = await axios.post(
        '/forecast/',
        [
          // Send dummy transactions as the endpoint expects a List[Transaction]
          { date: "2025-06-01", name: "Coffee", amount: -120, category: ["Food & Drink"] },
          { date: "2025-06-02", name: "Uber", amount: -350, category: ["Transport"] },
          { date: "2025-06-03", name: "Subway", amount: -200, category: ["Food & Drink"] },
          { date: "2025-06-04", name: "Book", amount: -500, category: ["Education"] }
        ],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
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
    fetchForecast(); // fetch dummy forecast on load
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
            '/advice',
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
          // Use real data if available, otherwise use dummy data
          if (transactions.length > 0) {
            fetchForecastWithRealData();
          } else {
            fetchForecast();
          }
          break;

        case 'RISK':
          alert('Risk analysis coming soon...');
          break;

        case 'TRANSACTIONS':
          if (bankConnected) {
            fetchRealTransactions();
          } else {
            // Show dummy transactions
            const txRes = await axios.get('/transactions', {
              headers: { Authorization: `Bearer ${token}` },
            });
            alert(`You have ${txRes.data.length} dummy transactions. Connect your bank for real data!`);
          }
          break;

        default:
          alert('Unknown action');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Handle successful bank connection
  const handleBankConnected = () => {
    setBankConnected(true);
    alert('Bank account connected successfully! You can now fetch real transaction history.');
  };

  return (
    <>
      <header className="header">
        <div className="app-name">BROKEBUDDY</div>
        <button className="logout-btn" onClick={logout}>LOGOUT</button>
      </header>

      <main className="main-content">
        <h1 className="welcome-text">WHAT DO YOU WANNA KNOW TODAY?</h1>

        {/* Bank Connection Section */}
        <div className="bank-connection" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          {!bankConnected ? (
            <div>
              <p style={{ color: '#00ff00', marginBottom: '1rem' }}>
                Connect your bank account for real transaction data:
              </p>
              <PlaidLink onSuccess={handleBankConnected} />
            </div>
          ) : (
            <div>
              <p style={{ color: '#00ff00', marginBottom: '1rem' }}>
                ✅ Bank Connected! You can now get real transaction history.
              </p>
              <button
                onClick={fetchRealTransactions}
                disabled={loadingTransactions}
                style={{
                  backgroundColor: '#00ff00',
                  color: '#000',
                  padding: '10px 20px',
                  border: 'none',
                  cursor: loadingTransactions ? 'not-allowed' : 'pointer',
                  marginRight: '10px'
                }}
              >
                {loadingTransactions ? 'Loading...' : 'REFRESH TRANSACTIONS'}
              </button>
              <span style={{ color: '#ffff00' }}>
                {transactions.length} transactions loaded
              </span>
            </div>
          )}
        </div>

        <div className="action-grid">
          <button className="action-btn" onClick={() => handleAction('ADVICE')}>GENERATE<br />ADVICE</button>
	  <button className="action-btn" onClick={() => handleAction('FORECAST')}>
  	    <>
    	      GET<br />FORECAST
    	      {transactions.length > 0 && <><br /><small>(REAL DATA)</small></>}
  	   </>
	</button>
          <button className="action-btn" onClick={() => handleAction('RISK')}>GET<br />RISK</button>
	  <button className="action-btn" onClick={() => handleAction('TRANSACTIONS')}>
  	    <>
    	      GET<br />TRANSACTION HISTORY
    	      {bankConnected && <><br /><small>(REAL DATA)</small></>}
  	   </>
	</button>
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
      {transactions.length > 0 && (
        <span style={{ color: '#00ff00', fontSize: '14px', display: 'block' }}>
          (Based on {transactions.length} real transactions)
        </span>
      )}
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
