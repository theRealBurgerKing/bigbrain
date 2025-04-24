import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import Register from './Register1';
import Login from './Login';
import Dashboard from './Dashboard';
import ErrorModal from './ErrorModal';
import GameEditor from './GameEditor';
import QuestionEditor from './QuestionEditor';
import GameSession from './GameSession';
import PlayGround from './PlayGround';
import NavigateToPlay from './NavigateToPlay';
import OldSession from './OldSession';
import Index from './Index';
import useMediaQuery from '@mui/material/useMediaQuery';
import styled from 'styled-components';

const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#f0f2f5',
  padding: isMobile ? '2vh 4vw' : '2vh 3vw',
  margin: '0',
  boxSizing: 'border-box',
}));

const Nav = styled.nav.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginBottom: '2vh',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '1vw',
}));

const LinkStyled = styled(Link).withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#3b82f6',
  textDecoration: 'none',
}));

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'isLoading'].includes(prop),
})(({ isMobile, isLoading }) => ({
  padding: isMobile ? '1.5vh 4vw' : '1vh 2vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: isLoading ? '#a3bffa' : '#3b82f6',
  border: 'none',
  borderRadius: '4px',
  cursor: isLoading ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.3s, transform 0.1s',
}));

const Hr = styled.hr(() => ({
  margin: '2vh 0',
  border: '0',
  borderTop: '1px solid #ccc',
}));

const Content = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

function Pages() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery('(max-width: 768px)');

  // Check if the current route is a play route
  const isPlayRoute = location.pathname.startsWith('/play');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('myemail');
    }
  }, [token]);

  const successJob = (token, email) => {
    if (!token) {
      setErrorMessage('Invalid token received.');
      setOpen(true);
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setToken(token);
    navigate('/dashboard');
  };

  const logout = async () => {
    if (!token) {
      setErrorMessage('No token found. Please log in again.');
      setOpen(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      localStorage.removeItem('myemail');
      setToken(null);
      navigate('/login');
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setErrorMessage('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('myemail');
          setToken(null);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setErrorMessage(err.response.data?.error || 'Unknown error');
        }
      } else if (err.request) {
        setErrorMessage('No response from server. Please check if the server is running.');
      } else {
        setErrorMessage(err.message);
      }
      setOpen(true);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('myemail');
      setIsLoading(false);
      navigate('/login');
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setOpen(true);
  };

  return (
    <Container isMobile={isMobile}>
      {!isPlayRoute && (
        <>
          <Nav isMobile={isMobile}>
            {token ? (
              <Button
                isMobile={isMobile}
                isLoading={isLoading}
                onClick={logout}
                disabled={isLoading}
                aria-label={isLoading ? 'Logging out' : 'Logout'}
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </Button>
            ) : (
              <>
                <LinkStyled
                  to="/register"
                  isMobile={isMobile}
                  aria-label="Navigate to register page"
                >
                  Register
                </LinkStyled>
                {isMobile ? <br /> : ' | '}
                <LinkStyled
                  to="/login"
                  isMobile={isMobile}
                  aria-label="Navigate to login page"
                >
                  Login
                </LinkStyled>
              </>
            )}
          </Nav>
          <Hr />
        </>
      )}

      <Content>
        <Routes>
          <Route path="/" element={<Index token={token} />} />
          <Route path="/register" element={<Register successJob={successJob} showError={showError} />} />
          <Route path="/login" element={<Login successJob={successJob} showError={showError} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/:gameId" element={<GameEditor />} />
          <Route path="/game/:gameId/questions" element={<QuestionEditor />} />
          <Route path="/game/:gameId/oldSession" element={<OldSession />} />
          <Route path="/game/:gameId/question/:questionId" element={<QuestionEditor />} />
          <Route path="/play" element={<NavigateToPlay />} />
          <Route path="/play/:sessionId" element={<PlayGround />} />
          <Route path="/session/:sessionId" element={<GameSession />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Content>

      <ErrorModal
        open={open}
        onClose={handleClose}
        message={errorMessage}
      />
    </Container>
  );
}

export default Pages;