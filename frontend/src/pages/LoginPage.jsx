import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/retro.css'; 

export default function LoginPage({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Remove the useEffect that redirects on mount - let App.jsx handle routing
  // useEffect(() => {
  //   if(localStorage.getItem('token')) {
  //     navigate('/dashboard');
  //   }
  // }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // Sign up flow
        await axios.post('/auth/signup', { username, password });
        setIsSignup(false);
        setError('Account created! Please login.');
      } else {
        // Login flow
        const res = await axios.post(
          '/auth/login',
          new URLSearchParams({ username, password }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        const accessToken = res.data.access_token;
        
        // Store token in localStorage
        localStorage.setItem('token', accessToken);
        
        // Update parent state
        setToken(accessToken);
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      const detail = err.response?.data?.detail || 'Authentication failed';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isSignup ? 'signup-container' : 'login-container'}>
      <h1>{isSignup ? 'CREATE ACCOUNT' : 'BROKEBUDDY LOGIN'}</h1>

      <form onSubmit={handleAuth}>
        <div className="form-group">
          <label htmlFor="username">USERNAME:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">PASSWORD:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {isSignup && (
          <div className="form-group">
            <label htmlFor="confirm">CONFIRM PASSWORD:</label>
            <input
              type="password"
              id="confirm"
              required
              disabled={loading}
              onChange={(e) => {
                if (e.target.value !== password) {
                  setError('Passwords do not match');
                } else {
                  setError('');
                }
              }}
            />
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'PROCESSING...' : (isSignup ? 'SIGN UP' : 'LOGIN')}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className={isSignup ? 'existing-user' : 'not-user'}>
        {isSignup ? (
          <>
            ALREADY A USER?{' '}
            <button 
              onClick={() => {
                setIsSignup(false);
                setError('');
              }} 
              className="link-btn"
              disabled={loading}
            >
              LOGIN HERE
            </button>
          </>
        ) : (
          <>
            NOT A USER?{' '}
            <button 
              onClick={() => {
                setIsSignup(true);
                setError('');
              }} 
              className="link-btn"
              disabled={loading}
            >
              CREATE ACCOUNT
            </button>
          </>
        )}
      </div>
    </div>
  );
}
