import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';
import Results from './Results';

function GameSession() {
  const location = useLocation();
  const gameId = location.state?.gameId;
  const question = location.state?.questions;

  const { sessionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [active, setActive] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showResultsOrNot, setShowResultsOrNot] = useState(false);
  const resultsShownRef = useRef(false);
  const [results, setResults] = useState([]);

  const fetchSession = async () => {
    if (!token) {
      setError('No token found. Please log in again.');
      const timeout = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timeout);
    }
    try {
      const response = await axios.get(`http://localhost:5005/admin/session/${sessionId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setSession(response.data.results);
        setActive(response.data.results.active);

        if (response.data.results.position >= 0 && response.data.results.active) {
          const startTime = new Date(response.data.results.isoTimeLastQuestionStarted).getTime();
          const duration = response.data.results.questions[response.data.results.position].duration * 1000;
          const now = Date.now();
          setTimeLeft(Math.max(0, Math.floor((startTime + duration - now) / 1000)));
        }
        if (!response.data.results.active && !resultsShownRef.current) {
          resultsShownRef.current = true;
          setShowResultsOrNot(true);
        }
      }
    } catch (err) {
      console.log(err);
      if (err.response) {
        if (err.response.status === 500) {
          setError('No such session is ON.');
          const timeout = setTimeout(() => navigate('/dashboard'), 2000);
          return () => clearTimeout(timeout);
        } else {
          setError(err.response.data.error);
        }
      }
    }
  };

  const nextQuestion = async (id) => {
    try {
      const response = await axios.post(
        `http://localhost:5005/admin/game/${id}/mutate`,
        { "mutationType": "ADVANCE" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        console.log(response.data);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        console.log(err);
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      fetchSession();
    }
  };

  const getResults = async (q) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/admin/session/${q}/results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        console.log(response.data);
        setResults(response.data);
      }
    } catch (err) {
      console.log(err);
    }

    setShowResults(true);
  };

  // Fetch data on mount
  useEffect(() => {
    if (!active) return;

    const intervalId = setInterval(() => {
      fetchSession();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Define styles as named objects
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '70vh',
    width: '100%',
    padding: '0px',
    margin: '0px',
  };

  const boxStyle = {
    width: '50vw',
    padding: '2vh 3vw',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    margin: '2vh 0',
  };

  const titleStyle = {
    fontSize: '3vh',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2vh',
  };

  const textStyle = {
    fontSize: '1.8vh',
    color: '#555',
    marginBottom: '0.5vh',
  };

  const errorStyle = {
    color: 'red',
    fontSize: '1.8vh',
    marginBottom: '1vh',
    textAlign: 'center',
  };

  const buttonContainerStyle = {
    marginTop: '2vh',
    textAlign: 'center',
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
    margin: '0.5vh 1vw',
    transition: 'background-color 0.3s, transform 0.1s',
  };

  const modalTextStyle = {
    fontSize: '1.8vh',
    color: '#333',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h2 style={titleStyle}>Game Session</h2>
        {error && <div style={errorStyle}>{error}</div>}

        {session ? (
          <>
            <div style={textStyle}>
              <strong>Session ID:</strong> {sessionId}
            </div>
            <div style={textStyle}>
              <strong>Active:</strong> {session.active ? 'On going' : 'Game Finish'}
            </div>
            <div style={textStyle}>
              <strong>Total Questions:</strong> {Object.keys(session.questions).length}
            </div>
            <div style={textStyle}>
              <strong>Current Question:</strong> 
              {session.position === -1 ? 'Waiting for start' : 
               (session.position + 1 > Object.keys(session.questions).length ? 'Showing result' : `Question ${session.position + 1}`)}
            </div>
            <div style={textStyle}>
              <strong>Answer Available:</strong> {session.answerAvailable ? 'Yes' : 'No'}
            </div>
            {timeLeft !== 0 ? (
              <div style={textStyle}>Question Time Left: {timeLeft} sec</div>
            ) : (
              <div style={textStyle}>Waiting for next question...</div>
            )}
          </>
        ) : (
          <p style={textStyle}>No status</p>
        )}

        <div style={buttonContainerStyle}>
          <button style={buttonStyle} onClick={() => nextQuestion(gameId)}>
            Next
          </button>
          <button style={buttonStyle} onClick={() => navigate('/dashboard')}>
            Back
          </button>
        </div>

        {showResultsOrNot && (
          <Modal onClose={() => setShowResultsOrNot(false)}>
            <p style={modalTextStyle}>Show Results?</p>
            <div style={buttonContainerStyle}>
              <button
                style={buttonStyle}
                onClick={() => {
                  getResults(sessionId);
                }}
              >
                Yes
              </button>
              <button
                style={buttonStyle}
                onClick={() => navigate('/dashboard')}
              >
                No
              </button>
            </div>
          </Modal>
        )}

        {showResults && (
          <Modal onClose={() => { setShowResults(false); setShowResultsOrNot(false); navigate('/dashboard') }}>
            <Results data={results} question={question} />
          </Modal>
        )}
      </div>
    </div>
  );
}

export default GameSession;