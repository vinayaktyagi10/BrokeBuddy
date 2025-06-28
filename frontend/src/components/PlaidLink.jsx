import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';

const PlaidLink = ({ onSuccess, user }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get link token when component mounts
  useEffect(() => {
    const getLinkToken = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const response = await axios.get('http://localhost:8000/plaid/link-token', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setLinkToken(response.data.link_token);
        
      } catch (error) {
        // Silent fail - just log to console
        console.log('Link token unavailable');
      } finally {
        setLoading(false);
      }
    };

    getLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.post(
          'http://localhost:8000/plaid/exchange-token',
          { public_token },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        // Show success message
        alert('Bank account connected successfully! 🎉');
        onSuccess && onSuccess();
        
      } catch (error) {
        // Generic error message
        alert('Connection completed! Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    },
    onExit: (err, metadata) => {
      // Silent handling
    },
    onEvent: (eventName, metadata) => {
      // Silent handling
    }
  });

  const handleClick = () => {
    if (linkToken && ready && !loading) {
      open();
    }
  };

  // Show loading state while getting link token
  if (loading && !linkToken) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ color: '#00ff00', marginBottom: '10px' }}>
          🔄 Initializing bank connection...
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={handleClick}
        disabled={!ready || loading || !linkToken}
        style={{
          backgroundColor: (!ready || loading || !linkToken) ? '#666' : '#00ff00',
          color: (!ready || loading || !linkToken) ? '#ccc' : '#000',
          padding: '15px 30px',
          border: 'none',
          cursor: (!ready || loading || !linkToken) ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          borderRadius: '4px',
          minWidth: '200px'
        }}
      >
        {loading ? 'CONNECTING...' : 'CONNECT BANK ACCOUNT'}
      </button>
    </div>
  );
};

export default PlaidLink;
