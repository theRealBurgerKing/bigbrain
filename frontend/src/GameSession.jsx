import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';
import Results from './Results';
import useMediaQuery from '@mui/material/useMediaQuery';
import styled from 'styled-components';

const Container = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  minHeight: '70vh',
  width: '100%',
  padding: '0px',
  margin: '0px',
}));

const Box = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '90vw' : '50vw',
  padding: isMobile ? '2vh 4vw' : '2vh 3vw',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  margin: '2vh 0',
}));

const Title = styled.h2.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '2rem' : '3vh',
  fontWeight: '600',
  color: '#333',
  marginBottom: '2vh',
}));

const Text = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
  marginBottom: '0.5vh',
}));

const ButtonContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginTop: '2vh',
  textAlign: 'center',
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '1vw',
  justifyContent: 'center',
}));

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  padding: isMobile ? '1.5vh 4vw' : '1vh 2vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: '#3b82f6',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s, transform 0.1s',
}));

const ModalText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#333',
  textAlign: 'center',
}));

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

  const isMobile = useMediaQuery('(max-width: 768px)');

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
        console.log('Next question advanced:', response.data);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
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
        setResults(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Failed to fetch results. Please try again.'
      );
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
  }, [active]);

  return (
    <Container>
      <Box isMobile={isMobile}>
        <Title isMobile={isMobile}>Game Session</Title>
        {session ? (
          <dl>
            <Text isMobile={isMobile}>
              <dt><strong>Session ID:</strong></dt>
              <dd>{sessionId}</dd>
            </Text>
            <Text isMobile={isMobile}>
              <dt><strong>Active:</strong></dt>
              <dd>{session.active ? 'On going' : 'Game Finish'}</dd>
            </Text>
            <Text isMobile={isMobile}>
              <dt><strong>Total Questions:</strong></dt>
              <dd>{Object.keys(session.questions).length}</dd>
            </Text>
            <Text isMobile={isMobile}>
              <dt><strong>Current Question:</strong></dt>
              <dd>{session.position === -1 ? 'Waiting for start' : (session.position + 1 > Object.keys(session.questions).length ? 'Showing result' : `Question ${session.position + 1}`)}</dd>
            </Text>
            <Text isMobile={isMobile}>
              <dt><strong>Answer Available:</strong></dt>
              <dd>{session.answerAvailable ? 'Yes' : 'No'}</dd>
            </Text>
            {timeLeft !== 0 ? (
              <Text isMobile={isMobile}>
                <dt>Question Time Left:</dt>
                <dd>{timeLeft} sec</dd>
              </Text>
            ) : (
              <Text isMobile={isMobile}>Waiting for next question...</Text>
            )}
          </dl>
        ) : (
          <Text isMobile={isMobile}>No status</Text>
        )}

        <ButtonContainer isMobile={isMobile}>
          <Button
            isMobile={isMobile}
            onClick={() => nextQuestion(gameId)}
            aria-label="Advance to the next question"
          >
            Next
          </Button>
          <Button
            isMobile={isMobile}
            onClick={() => navigate('/dashboard')}
            aria-label="Return to dashboard"
          >
            Back
          </Button>
        </ButtonContainer>

        {showResultsOrNot && (
          <Modal onClose={() => setShowResultsOrNot(false)}>
            <ModalText isMobile={isMobile}>Show Results?</ModalText>
            <ButtonContainer isMobile={isMobile}>
              <Button
                isMobile={isMobile}
                onClick={() => {
                  getResults(sessionId);
                }}
                aria-label="Show game results"
              >
                Yes
              </Button>
              <Button
                isMobile={isMobile}
                onClick={() => navigate('/dashboard')}
                aria-label="Skip results and return to dashboard"
              >
                No
              </Button>
            </ButtonContainer>
          </Modal>
        )}

        {showResults && (
          <Modal onClose={() => { setShowResults(false); setShowResultsOrNot(false); navigate('/dashboard') }}>
            <Results data={results} question={question} />
          </Modal>
        )}

        {error && (
          <Modal onClose={() => setError('')}>
            <ModalText isMobile={isMobile}>{error}</ModalText>
            <ButtonContainer isMobile={isMobile}>
              <Button
                isMobile={isMobile}
                onClick={() => setError('')}
                aria-label="Close error message"
              >
                OK
              </Button>
            </ButtonContainer>
          </Modal>
        )}
      </Box>
    </Container>
  );
}

export default GameSession;