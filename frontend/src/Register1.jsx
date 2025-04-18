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
    // DON'T DELETE IT, JUST FOR TESTING CONVENIENCE
    // // Check the email
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   showError('Please enter a valid email address.');
    //   return;
    // }

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

  // Inline CSS styles
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    // alignItems: 'center',
    height: '100%',
    width: '100%',
    padding: '0px',
    margin:'0px',
  };

  const registerBoxStyle = {
    width: '30vw', // Fixed width relative to viewport
    height: '60vh', // Taller than login to accommodate extra fields
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2vh 3vw', // Padding in viewport units
    margin: '0px',
  };

  const titleStyle = {
    fontSize: '2.5vh', // Font size in viewport height units
    fontWeight: '600',
    color: '#333',
    marginBottom: '2vh',
  };

  const inputGroupStyle = {
    marginBottom: '1.5vh', // Reduced spacing for more fields
    width: '25vw', // Input group width in viewport units
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
    padding: '1.2vh 2vw', // Slightly smaller padding for compact layout
    fontSize: '1.8vh', // Font size in viewport units
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: isLoading ? '#f5f5f5' : '#fff',
    cursor: isLoading ? 'not-allowed' : 'text',
  };

  const buttonStyle = {
    width: '25vw', // Button width matches input group
    padding: '1.2vh 0', // Padding in viewport units
    fontSize: '1.8vh', // Font size in viewport units
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
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text" // Changed from commented type="email" for consistency
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Username</label>
          <input
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Enter your username"
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
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Confirm Password</label>
          <input
            style={inputStyle}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={handleConfirmPasswordBlur}
            onKeyDown={handleKeyDown}
            type="password"
            placeholder="Confirm your password"
            disabled={isLoading}
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