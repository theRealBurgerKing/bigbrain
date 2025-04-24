import { useState } from 'react';
import axios from 'axios';
import { useMediaQuery } from '@mui/material';

function Register({ successJob, showError }) {
  const isMobile = useMediaQuery('(max-width:768px)');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmPasswordBlur = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (password && newConfirmPassword && password !== newConfirmPassword) {
      showError('Passwords do not match.');
    }
  };

  const register = async () => {
    if (!email || !username || !password || !confirmPassword) {
      showError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5005/admin/auth/register', {
        email,
        username,
        password,
      });
      const token = response.data.token;
      if (!token) {
        showError('Registration successful, but no token received.');
        return;
      }
      localStorage.setItem('myemail', email);
      successJob(token);
    } catch (err) {
      if (err.response) {
        showError(err.response.data?.error || 'Unknown error during registration.');
      } else if (err.request) {
        showError('No response from server. Please check if the server is running.');
      } else {
        showError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      register();
    }
  };


  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: 0,
    margin: 0,
  };

  const registerBoxStyle = {
    width: isMobile ? '90vw' : '30vw',
    height: isMobile ? 'auto' : '60vh',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '5vw' : '2vh 3vw',
    marginTop: '4vh',
  };

  const titleStyle = {
    fontSize: isMobile ? '20px' : '2.5vh',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2vh',
  };

  const inputGroupStyle = {
    marginBottom: '1.5vh',
    width: isMobile ? '100%' : '25vw',
    textAlign: 'left',
  };

  const labelStyle = {
    fontSize: isMobile ? '14px' : '1.5vh',
    color: '#555',
    marginBottom: '0.5vh',
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    padding: '1.2vh 2vw',
    fontSize: isMobile ? '14px' : '1.8vh',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: isLoading ? '#f5f5f5' : '#fff',
    cursor: isLoading ? 'not-allowed' : 'text',
  };

  const buttonStyle = {
    width: isMobile ? '100%' : '24vw',
    padding: '1.2vh 0',
    fontSize: isMobile ? '16px' : '1.8vh',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: isLoading ? '#a3bffa' : '#3b82f6',
    border: 'none',
    borderRadius: '4px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    marginTop: '3vh',
    transition: 'background-color 0.3s',
  };

  return (
    <div style={containerStyle}>
      <div style={registerBoxStyle} aria-label="Registration form">
        <h1 style={titleStyle}>Register</h1>
        <div style={inputGroupStyle}>
          <label id="emailText2" style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Enter your email"
            disabled={isLoading}
            required
            aria-label="Email address"
            aria-describedby="emailText2"
          />
        </div>
        <div style={inputGroupStyle}>
          <label id="usernameText" style={labelStyle}>Username</label>
          <input
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Enter your username"
            disabled={isLoading}
            required
            aria-label="Username"
            aria-describedby="usernameText"
          />
        </div>
        <div style={inputGroupStyle}>
          <label id="passwordText" style={labelStyle}>Password</label>
          <input
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            type="password"
            placeholder="Enter your password"
            disabled={isLoading}
            required
            aria-label="Password"
            aria-describedby="passwordText"
          />
        </div>
        <div style={inputGroupStyle}>
          <label id="confirmPasswordText" style={labelStyle}>Confirm Password</label>
          <input
            style={inputStyle}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={handleConfirmPasswordBlur}
            onKeyDown={handleKeyDown}
            type="password"
            placeholder="Confirm your password"
            disabled={isLoading}
            required
            aria-label="Confirm password"
            aria-describedby="confirmPasswordText"
          />
        </div>
        <button
          style={buttonStyle}
          type="submit"
          onClick={register}
          disabled={isLoading}
          aria-label="Register now"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </div>
  );
}

export default Register;