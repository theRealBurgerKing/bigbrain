import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Register from './Register1';
import Login from './Login';
import Dashboard from './Dashboard';
import ErrorModal from './ErrorModal';

function Pages() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const successJob = (token) => {
    if (!token) {
      setErrorMessage('Invalid token received.');
      setOpen(true);
      return;
    }
    localStorage.setItem('token', token);
    setToken(token);
    navigate('/dashboard');
  };

  const logout = async () => {
    console.log('Token:', token);
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
      setToken(null);
      navigate('/login');
    } catch (err) {
      console.log('Error occurred:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setErrorMessage('Session expired. Please log in again.');
          localStorage.removeItem('token');
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
      setIsLoading(false);
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
    <>
      {token ? (
        <>
          <button onClick={logout} disabled={isLoading}>
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </>
      ) : (
        <>
          <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
        </>
      )}

      <hr />
      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/register" element={<Register successJob={successJob} showError={showError} />} />
        <Route path="/login" element={<Login successJob={successJob} showError={showError} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>

      <ErrorModal
        open={open}
        onClose={handleClose}
        message={errorMessage}
      />
    </>
  );
}

export default Pages;