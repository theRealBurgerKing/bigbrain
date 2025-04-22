import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
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

function Pages() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
      console.log('Error occurred:', err);
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

  // Define styles as named objects
  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f0f2f5',
    padding: '2vh 3vw',
    margin: '0',
    boxSizing: 'border-box',
  };

  const navStyle = {
    marginBottom: '2vh',
    textAlign: 'center',
  };

  const linkStyle = {
    fontSize: '1.8vh',
    color: '#3b82f6',
    textDecoration: 'none',
    margin: '0 1vw',
  };

  const buttonStyle = {
    padding: '1vh 2vw',
    fontSize: '1.8vh',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
  };

  const disabledButtonStyle = {
    padding: '1vh 2vw',
    fontSize: '1.8vh',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#a3bffa',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
  };

  const hrStyle = {
    margin: '2vh 0',
    border: '0',
    borderTop: '1px solid #ccc',
  };

  const contentStyle = {
    display: 'flex',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      {!isPlayRoute && (
        <>
          <nav style={navStyle}>
            {token ? (
              <button
                style={isLoading ? disabledButtonStyle : buttonStyle}
                onClick={logout}
                disabled={isLoading}
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            ) : (
              <>
                <Link to="/register" style={linkStyle}>Register</Link> |{' '}
                <Link to="/login" style={linkStyle}>Login</Link>
              </>
            )}
          </nav>
          <hr style={hrStyle} />
        </>
      )}

      <div style={contentStyle}>
        <Routes>
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<Index token = {token} />} />
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
      </div>

      <ErrorModal
        open={open}
        onClose={handleClose}
        message={errorMessage}
      />
    </div>
  );
}

export default Pages;