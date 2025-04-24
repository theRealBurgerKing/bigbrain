import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const Text = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
  marginBottom: '0.5vh',
}));

const SessionList = styled.ul(() => ({
  listStyle: 'none',
  padding: '0',
  margin: '0',
}));

const SessionItem = styled.li.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  padding: isMobile ? '1.5vh 2vw' : '1vh 1vw',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5vh',
  borderBottom: '1px solid #eee',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '0',
}));

const SessionText = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#333',
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

const ModalText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#333',
  textAlign: 'center',
}));

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

  return (
    <Container>
      <Box isMobile={isMobile}>
        <Title isMobile={isMobile}>Sessions Review</Title>
        <ButtonContainer isMobile={isMobile}>
          <Button
            isMobile={isMobile}
            onClick={() => navigate('/dashboard')}
            aria-label="Return to dashboard"
          >
            Back to Dashboard
          </Button>
        </ButtonContainer>
        {Array.isArray(oldSessions) && oldSessions.length > 0 ? (
          <SessionList>
            {oldSessions.map((q, index) => (
              <SessionItem key={index} isMobile={isMobile}>
                <SessionText isMobile={isMobile}>{q}</SessionText>
                <Button
                  isMobile={isMobile}
                  onClick={() => getResults(q)}
                  aria-label={`View results for session ${q}`}
                >
                  Result
                </Button>
              </SessionItem>
            ))}
          </SessionList>
        ) : (
          <Text isMobile={isMobile}>No old session available.</Text>
        )}

        {showResults && (
          <Modal onClose={() => setShowResults(false)}>
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

export default OldSession;