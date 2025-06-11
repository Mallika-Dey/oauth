import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from './pkceUtils';

const clientId = 'CID';
const redirectUri = 'http://localhost:5173';
const authUrl = 'http://localhost:9090/realms/mallika_realm/protocol/openid-connect/auth';
const tokenUrl = 'http://localhost:9090/realms/mallika_realm/protocol/openid-connect/token';
const logoutUrl = 'http://localhost:9090/realms/mallika_realm/protocol/openid-connect/logout';
const apiUrl = 'http://localhost:8080/api/v1/user';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);

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
      const response = await axios.get(apiUrl, {
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
    } catch (error) {
      console.error('Token exchange error:', error);
    }
  };

  const logout = () => {
// Clear session
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('access_token');
    setAccessToken(null);
    setUserData(null);
    const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: redirectUri,
  });

  // Redirect to Keycloak logout endpoint
  window.location.href = `${logoutUrl}?${params.toString()}`;
  };


  return (
    <div>
      <h1>Keycloak PKCE Auth</h1>
      {accessToken ? (
        
        <div>
          <p>Logged in</p>
          <button onClick={logout}>Logout</button>
          {userData && (
            <div>
              <h3>User Data:</h3>
              <pre>{JSON.stringify(userData, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <button onClick={login}>Login with Keycloak</button>
      )}
    </div>
  );
}

export default App;
