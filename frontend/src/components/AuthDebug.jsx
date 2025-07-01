import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const AuthDebugComponent = () => {
  const [authState, setAuthState] = useState({
    token: null,
    isValidToken: false,
    tokenParts: 0,
    user: null,
    lastError: null
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = () => {
    // Check localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken');
    
    let isValid = false;
    let parts = 0;
    
    if (token) {
      // Check if it's a valid JWT format (3 parts separated by dots)
      const tokenParts = token.split('.');
      parts = tokenParts.length;
      isValid = parts === 3;
    }

    setAuthState({
      token: token ? token.substring(0, 50) + '...' : null,
      isValidToken: isValid,
      tokenParts: parts,
      user: JSON.parse(localStorage.getItem('user') || 'null'),
      lastError: null
    });
  };

  const testBackendAuth = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('authToken');
    
    if (!token) {
      setAuthState(prev => ({ ...prev, lastError: 'No token found in localStorage' }));
      return;
    }

    try {
      const response = await fetch('/api/forecast/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          {
            "date": "2025-06-01",
            "name": "Coffee",
            "amount": -120,
            "category": ["Food & Drink"]
          }
        ])
      });

      if (response.ok) {
        setAuthState(prev => ({ ...prev, lastError: 'SUCCESS: Backend accepted token' }));
      } else {
        const errorText = await response.text();
        setAuthState(prev => ({ ...prev, lastError: `Backend error: ${response.status} - ${errorText}` }));
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, lastError: `Network error: ${error.message}` }));
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    checkAuthState();
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: 'testuser',
          password: 'testpass'
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setAuthState(prev => ({ ...prev, lastError: 'Login successful! Token saved.' }));
        checkAuthState();
      } else {
        const errorText = await response.text();
        setAuthState(prev => ({ ...prev, lastError: `Login failed: ${response.status} - ${errorText}` }));
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, lastError: `Login error: ${error.message}` }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🔍 Auth Debug Panel</h2>
      
      {/* Auth Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Authentication Status
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {authState.token ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">
              Token present: {authState.token ? 'Yes' : 'No'}
            </span>
          </div>
          
          {authState.token && (
            <>
              <div className="flex items-center gap-2">
                {authState.isValidToken ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">
                  Token format: {authState.tokenParts} parts {authState.isValidToken ? '(Valid JWT)' : '(Invalid)'}
                </span>
              </div>
              
              <div className="text-xs text-gray-600 mt-2">
                Token preview: {authState.token}
              </div>
            </>
          )}
          
          <div className="flex items-center gap-2">
            {authState.user ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm">
              User data: {authState.user ? JSON.stringify(authState.user) : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {authState.lastError && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          authState.lastError.includes('SUCCESS') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <strong>Last Test Result:</strong> {authState.lastError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={checkAuthState}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🔄 Refresh Status
        </button>
        
        <button
          onClick={testBackendAuth}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          🧪 Test Backend Auth
        </button>
        
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          🔑 Test Login
        </button>
        
        <button
          onClick={clearAuth}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          🗑️ Clear Auth
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">🛠️ Debugging Steps:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Check if token exists in localStorage</li>
          <li>Verify token has 3 parts (valid JWT format)</li>
          <li>Test if backend accepts the token</li>
          <li>If login fails, check your backend auth endpoints</li>
          <li>Check browser Network tab for actual request headers</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDebugComponent;
