import { useState } from 'react';
import axios from 'axios';

function Register({ successJob, showError }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verify that the password matches when onblur
  const handleConfirmPasswordBlur = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    // Performed only if neither field is empty
    if (password && newConfirmPassword && password !== newConfirmPassword) {
      showError('Passwords do not match.');
    }
  };

  // Handle registration submission
  const register = async () => {
    // Check whether the value is null
    if (!email || !username || !password || !confirmPassword) {
      showError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }
    // Check the email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5005/admin/auth/register', {
        email: email,
        username: username,
        password: password,
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

  // Handle Enter key press to trigger registration
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      register();
    }
  };

  // Define CSS styles
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: '0px',
    margin:'0px',
  };

  const registerBoxStyle = {
    width: '30vw',
    height: '60vh',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2vh 3vw',
    margin: '0px',
    marginTop: '4vh',
  };

  const titleStyle = {
    fontSize: '2.5vh',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2vh',
  };

  const inputGroupStyle = {
    marginBottom: '1.5vh',
    width: '25vw',
    textAlign: 'left',
  };

  const labelStyle = {
    fontSize: '1.5vh',
    color: '#555',
    marginBottom: '0.5vh',
    display: 'block',
  };

  const inputStyle = {
    width: '80%',
    padding: '1.2vh 2vw',
    fontSize: '1.8vh',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: isLoading ? '#f5f5f5' : '#fff',
    cursor: isLoading ? 'not-allowed' : 'text',
  };

  const buttonStyle = {
    width: '24vw',
    padding: '1.2vh 0',
    fontSize: '1.8vh',
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
      <div style={registerBoxStyle}>
        <h1 style={titleStyle}>Register</h1>
        <div style={inputGroupStyle}>
          <label id = "emailText2" style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Enter your email"
            disabled={isLoading}
            required
            aria-describedby="emailText2"
          />
        </div>
        <div style={inputGroupStyle}>
          <label id = "usernameText" style={labelStyle}>Username</label>
          <input
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Enter your username"
            disabled={isLoading}
            required
            aria-describedby="usernameText"
          />
        </div>
        <div style={inputGroupStyle}>
          <label id = "passwordText" style={labelStyle}>Password</label>
          <input
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            type="password"
            placeholder="Enter your password"
            disabled={isLoading}
            required
            aria-describedby="passwordText"
          />
        </div>
        <div style={inputGroupStyle}>
          <label id = "confirmPasswordText" style={labelStyle}>Confirm Password</label>
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
            aria-describedby="confirmPasswordText"
          />
        </div>
        <button
          style={buttonStyle}
          type="submit"
          onClick={register}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </div>
  );
}

export default Register;