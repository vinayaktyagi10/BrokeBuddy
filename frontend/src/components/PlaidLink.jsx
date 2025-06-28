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
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/plaid/link-token', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error('Error getting link token:', error);
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
        await axios.post(
          'http://localhost:8000/plaid/exchange-token',
          { public_token },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert('Bank account connected successfully!');
        onSuccess && onSuccess();
      } catch (error) {
        console.error('Error exchanging token:', error);
        alert('Failed to connect bank account');
      } finally {
        setLoading(false);
      }
    },
    onExit: (err, metadata) => {
      console.log('Plaid Link exited:', err, metadata);
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {loading ? 'Connecting...' : 'Connect Bank Account'}
    </button>
  );
};

export default PlaidLink;
