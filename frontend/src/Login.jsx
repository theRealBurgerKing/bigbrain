import { useState } from 'react';
import axios from 'axios';
import useMediaQuery from '@mui/material/useMediaQuery';
import styled from 'styled-components';

const Container = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  padding: '0px',
}));

const LoginBox = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '90vw' : '30vw',
  height: isMobile ? 'auto' : '40vh',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2vh 3vw',
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
  marginBottom: '2vh',
  width: isMobile ? '80vw' : '23vw',
  textAlign: 'left',
}));

const Label = styled.label.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
  marginBottom: '0.5vh',
  display: 'block',
}));

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'isLoading'].includes(prop),
})(({ isMobile, isLoading }) => ({
  width: '100%',
  padding: '1.5vh 2vw',
  fontSize: isMobile ? '1rem' : '1.5vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: isLoading ? '#f5f5f5' : '#fff',
  cursor: isLoading ? 'not-allowed' : 'text',
}));

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'isLoading'].includes(prop),
})(({ isMobile, isLoading }) => ({
  width: isMobile ? '80vw' : '22.5vw',
  padding: '1.5vh 0',
  fontSize: isMobile ? '1rem' : '1.8vh',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: isLoading ? '#a3bffa' : '#3b82f6',
  border: 'none',
  borderRadius: '4px',
  cursor: isLoading ? 'not-allowed' : 'pointer',
  marginTop: '1vh',
  transition: 'background-color 0.3s',
}));

function Login({ successJob, showError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      login();
    }
  };

  return (
    <Container>
      <LoginBox isMobile={isMobile}>
        <Title isMobile={isMobile}>Login</Title>
        <InputGroup isMobile={isMobile}>
          <Label id="emailText" isMobile={isMobile}>Email</Label>
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
            aria-label="Email Address"
            aria-describedby="emailText"
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
        <Button
          isMobile={isMobile}
          isLoading={isLoading}
          type="submit"
          onClick={login}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </LoginBox>
    </Container>
  );
}

export default Login;