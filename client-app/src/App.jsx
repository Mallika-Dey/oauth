import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from './pkceUtils';

const clientId = 'CID';
const redirectUri = 'http://localhost:5173';
const authUrl = 'http://localhost:9090/realms/mallika_realm/protocol/openid-connect/auth';
const tokenUrl = 'http://localhost:9090/realms/mallika_realm/protocol/openid-connect/token';
const logoutUrl = 'http://localhost:9090/realms/mallika_realm/protocol/openid-connect/logout';
const apiUrl = 'http://localhost:8080/api/v1/user';
const bffUrl = 'http://localhost:8081/api'; // BFF endpoint

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    if (authCode) {
      console.log("authCode received:", authCode);
      const storedVerifier = sessionStorage.getItem('pkce_code_verifier');
      exchangeCodeForToken(authCode, storedVerifier);
    }
  }, []);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('access_token');
    if (storedToken) setAccessToken(storedToken);
    if (accessToken) {
      fetchUserData();
    }
  }, [accessToken]);

  const fetchUserData = async () => {
    try {
      const response = await apiRequest(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('API Response:', response.data);
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  // Enhanced API request with automatic token refresh
  const apiRequest = async (url, options = {}) => {
    try {
      const response = await axios(url, options);
      return response;
    } catch (error) {
      // Check if error is due to expired token (401 Unauthorized)
      if (error.response && error.response.status === 401 && !isRefreshing) {
        console.log('Token expired, attempting refresh...');
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Retry the original request with new token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${accessToken}`
            }
          };
          return await axios(url, newOptions);
        } else {
          // Refresh failed, redirect to login
          handleAuthFailure();
          throw error;
        }
      }
      throw error;
    }
  };

  const refreshToken = async () => {
    if (isRefreshing) {
      return false;
    }

    setIsRefreshing(true);
    
    try {
      const storedRefreshToken = sessionStorage.getItem('refresh_token');
      
      if (!storedRefreshToken) {
        console.log('No refresh token available');
        return false;
      }

      console.log('Calling BFF refresh endpoint...');
      
      const response = await axios.post(`${bffUrl}/refresh-token`, {
        refreshToken: storedRefreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { access_token, refresh_token } = response.data;
      
      if (access_token) {
        console.log('Token refreshed successfully');
        setAccessToken(access_token);
        sessionStorage.setItem('access_token', access_token);
        
        if (refresh_token) {
          sessionStorage.setItem('refresh_token', refresh_token);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAuthFailure = () => {
    console.log('Authentication failed, clearing session and redirecting to login');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setAccessToken(null);
    setUserData(null);
    // Optionally redirect to login or show login button
  };

  const login = async () => {
    const codeVerifier = generateCodeVerifier();
    console.log("login initiating.....")
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('pkce_code_verifier', codeVerifier);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${authUrl}?${params.toString()}`;
  };

  const exchangeCodeForToken = async (code, codeVerifier) => {
    console.log("exchangeCodeForToken called with code and codeVerifier:");
    try {
      const data = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      });

      const response = await axios.post(tokenUrl, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      setAccessToken(response.data.access_token);
      sessionStorage.setItem('access_token', response.data.access_token);
      
      // Store refresh token if available
      if (response.data.refresh_token) {
        sessionStorage.setItem('refresh_token', response.data.refresh_token);
        console.log('Refresh token stored');
      }
      
    } catch (error) {
      console.error('Token exchange error:', error);
    }
  };

  const logout = () => {
    // Clear session
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setAccessToken(null);
    setUserData(null);
    
    const params = new URLSearchParams({
      client_id: clientId,
      post_logout_redirect_uri: redirectUri,
    });

    // Redirect to Keycloak logout endpoint
    window.location.href = `${logoutUrl}?${params.toString()}`;
  };

  // Manual refresh token button for testing
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    const success = await refreshToken();
    if (success) {
      console.log('Manual refresh successful');
      fetchUserData(); // Refresh user data with new token
    } else {
      console.log('Manual refresh failed');
    }
  };

  return (
    <div>
      <h1>Keycloak PKCE Auth</h1>
      {accessToken ? (
        <div>
          <div>
            <h2>Logged in</h2>
            <button onClick={logout}>Logout</button>
            <button onClick={handleManualRefresh} disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing...' : 'Manual Refresh Token'}
            </button>
            {userData && (
              <div>
                <h3>User Data:</h3>
                <pre>{JSON.stringify(userData, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button onClick={login}>Login with Keycloak</button>
      )}
    </div>
  );
}

export default App;