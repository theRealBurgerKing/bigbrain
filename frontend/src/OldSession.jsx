import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';
import Results from './Results';
import useMediaQuery from '@mui/material/useMediaQuery';

function OldSession() {
  const location = useLocation();
  const oldSessions = location.state?.old;
  const question = location.state?.questions;
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const [results, setResults] = useState([]);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const getResults = async (q) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/admin/session/${q}/results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setResults(response.data);
        setShowResults(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Failed to fetch results. Please try again.'
      );
    }
  };

  // Define styles with mobile responsiveness
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '70vh',
    width: '100%',
    padding: '0px',
    margin: '0px',
  };

  const boxStyle = {
    width: isMobile ? '90vw' : '50vw',
    padding: isMobile ? '2vh 4vw' : '2vh 3vw',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    margin: '2vh 0',
  };

  const titleStyle = {
    fontSize: isMobile ? '2rem' : '3vh',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2vh',
  };

  const textStyle = {
    fontSize: isMobile ? '1rem' : '1.8vh',
    color: '#555',
    marginBottom: '0.5vh',
  };

  const sessionListStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  };

  const sessionItemStyle = {
    padding: isMobile ? '1.5vh 2vw' : '1vh 1vw',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5vh',
    borderBottom: '1px solid #eee',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '1vh' : '0',
  };

  const sessionTextStyle = {
    fontSize: isMobile ? '1rem' : '1.8vh',
    color: '#333',
  };

  const buttonStyle = {
    padding: isMobile ? '1.5vh 4vw' : '1vh 2vw',
    fontSize: isMobile ? '1rem' : '1.8vh',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
  };

  const buttonContainerStyle = {
    marginTop: '2vh',
    textAlign: 'center',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '1vh' : '1vw',
    justifyContent: 'center',
  };

  const modalTextStyle = {
    fontSize: isMobile ? '1rem' : '1.8vh',
    color: '#333',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>Sessions Review</h2>
        <div style={buttonContainerStyle}>
          <button
            style={buttonStyle}
            onClick={() => navigate('/dashboard')}
            aria-label="Return to dashboard"
          >
            Back to Dashboard
          </button>
        </div>
        {Array.isArray(oldSessions) && oldSessions.length > 0 ? (
          <ul style={sessionListStyle}>
            {oldSessions.map((q, index) => (
              <li key={index} style={sessionItemStyle}>
                <span style={sessionTextStyle}>{q}</span>
                <button
                  style={buttonStyle}
                  onClick={() => getResults(q)}
                  aria-label={`View results for session ${q}`}
                >
                  Result
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={textStyle}>No old session available.</p>
        )}

        {showResults && (
          <Modal onClose={() => setShowResults(false)}>
            <Results data={results} question={question} />
          </Modal>
        )}

        {error && (
          <Modal onClose={() => setError('')}>
            <p style={modalTextStyle}>{error}</p>
            <div style={buttonContainerStyle}>
              <button
                style={buttonStyle}
                onClick={() => setError('')}
                aria-label="Close error message"
              >
                OK
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default OldSession;