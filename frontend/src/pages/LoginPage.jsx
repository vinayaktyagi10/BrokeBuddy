import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/retro.css'; 

export default function LoginPage({setToken}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  useEffect(() => {
	  if(localStorage.getItem('token')) {
		  navigate('/dashboard');
	  }
  }, []);
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await axios.post('/auth/signup', { username, password });
        setIsSignup(false);
        setError('');
      } else {
        const res = await axios.post(
          '/auth/login',
          new URLSearchParams({ username, password }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        localStorage.setItem('token', res.data.access_token);
        setToken(res.data.access_token); // ✅ update parent state directly
        navigate('/dashboard');
        setError('');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Something went wrong');
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
          />
        </div>

        {isSignup && (
          <div className="form-group">
            <label htmlFor="confirm">CONFIRM PASSWORD:</label>
            <input
              type="password"
              id="confirm"
              required
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

        <button type="submit" className="btn">
          {isSignup ? 'SIGN UP' : 'LOGIN'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className={isSignup ? 'existing-user' : 'not-user'}>
        {isSignup ? (
          <>
            ALREADY A USER?{' '}
            <button onClick={() => setIsSignup(false)} className="link-btn">
              LOGIN HERE
            </button>
          </>
        ) : (
          <>
            NOT A USER?{' '}
            <button onClick={() => setIsSignup(true)} className="link-btn">
              CREATE ACCOUNT
            </button>
          </>
        )}
      </div>
    </div>
  );
}
