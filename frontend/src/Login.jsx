import { useState } from 'react';
import axios from 'axios';

function Login({ successJob, showError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle login submission
  const login = async () => {
    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5005/admin/auth/login', {
        email: email,
        password: password,
      });
      const token = response.data.token;
      localStorage.setItem('myemail', email);
      successJob(token, email);
    } catch (err) {
      if (err.response) {
        showError(err.response.data?.error || 'Unknown error');
      } else if (err.request) {
        showError('No response from server. Please check if the server is running.');
      } else {
        showError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press to trigger login
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      login();
    }
  };

  // Inline CSS styles
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    //alignItems: 'center',
    height: '100%',
    width: '100%',
    //backgroundColor: '#f0f2f5',
    padding: '0px',
    //paddingTop: '30px',
  };

  const loginBoxStyle = {
    width: '20vw', // Fixed width relative to viewport
    height: '50vh', // Fixed height relative to viewport
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2vh 3vw', // Padding in viewport units
    marginTop: '4vh',
  };

  const titleStyle = {
    fontSize: '2.5vh', // Font size in viewport height units
    fontWeight: '600',
    color: '#333',
    marginBottom: '2vh',
  };

  const inputGroupStyle = {
    marginBottom: '2vh',
    width: '23vw', // Input group width in viewport units
    textAlign: 'left',
  };

  const labelStyle = {
    fontSize: '1.5vh', // Label font size in viewport units
    color: '#555',
    marginBottom: '0.5vh',
    display: 'block',
  };

  const inputStyle = {
    width: '80%', // Full width of input group
    padding: '1.5vh 2vw', // Padding in viewport units
    fontSize: '1.8vh', // Font size in viewport units
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: isLoading ? '#f5f5f5' : '#fff',
    cursor: isLoading ? 'not-allowed' : 'text',
  };

  const buttonStyle = {
    width: '20vw', // Button width matches input group
    padding: '1.5vh 0', // Padding in viewport units
    fontSize: '1.8vh', // Font size in viewport units
    fontWeight: '500',
    color: '#fff',
    backgroundColor: isLoading ? '#a3bffa' : '#3b82f6',
    border: 'none',
    borderRadius: '4px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    marginTop: '1vh',
    transition: 'background-color 0.3s',
  };

  return (
    <div style={containerStyle}>
      <div style={loginBoxStyle}>
        <h1 style={titleStyle}>Login</h1>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Password</label>
          <input
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            type="password"
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>
        <button
          style={buttonStyle}
          type="submit"
          onClick={login}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}

export default Login;