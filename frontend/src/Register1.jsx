import { useState } from 'react';
import axios from 'axios';
import { useMediaQuery } from '@mui/material';
import styled from 'styled-components';

const Container = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  padding: 0,
  margin: 0,
}));

const RegisterBox = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
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
}));

const Title = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '20px' : '2.5vh',
  fontWeight: '600',
  color: '#333',
  marginBottom: '2vh',
}));

const InputGroup = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginBottom: '1.5vh',
  width: isMobile ? '100%' : '25vw',
  textAlign: 'left',
}));

const Label = styled.label.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '14px' : '1.5vh',
  color: '#555',
  marginBottom: '0.5vh',
  display: 'block',
}));

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'isLoading'].includes(prop),
})(({ isMobile, isLoading }) => ({
  width: '80%',
  padding: '1.2vh 2vw',
  fontSize: isMobile ? '14px' : '1.8vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: isLoading ? '#f5f5f5' : '#fff',
  cursor: isLoading ? 'not-allowed' : 'text',
}));

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'isLoading'].includes(prop),
})(({ isMobile, isLoading }) => ({
  width: isMobile ? '30vw' : '24vw',
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
}));

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

  return (
    <Container>
      <RegisterBox isMobile={isMobile} aria-label="Registration form">
        <Title isMobile={isMobile}>Register</Title>
        <InputGroup isMobile={isMobile}>
          <Label id="-axisText2" isMobile={isMobile}>Email</Label>
          <Input
            isMobile={isMobile}
            isLoading={isLoading}
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
        </InputGroup>
        <InputGroup isMobile={isMobile}>
          <Label id="usernameText" isMobile={isMobile}>Username</Label>
          <Input
            isMobile={isMobile}
            isLoading={isLoading}
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
        </InputGroup>
        <InputGroup isMobile={isMobile}>
          <Label id="passwordText" isMobile={isMobile}>Password</Label>
          <Input
            isMobile={isMobile}
            isLoading={isLoading}
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
        </InputGroup>
        <InputGroup isMobile={isMobile}>
          <Label id="confirmPasswordText" isMobile={isMobile}>Confirm Password</Label>
          <Input
            isMobile={isMobile}
            isLoading={isLoading}
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
        </InputGroup>
        <Button
          isMobile={isMobile}
          isLoading={isLoading}
          type="submit"
          onClick={register}
          disabled={isLoading}
          aria-label="Register now"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </RegisterBox>
    </Container>
  );
}

export default Register;