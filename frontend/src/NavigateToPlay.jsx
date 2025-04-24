import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import styled from 'styled-components';
import useMediaQuery from '@mui/material/useMediaQuery';

const Container = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  minHeight: '40vh',
  width: '100%',
  padding: '0px',
  margin: '0px',
}));

const Box = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '90vw' : '30vw',
  padding: isMobile ? '3vh 5vw' : '2vh 3vw',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginTop: '20vh',
  textAlign: 'center',
}));

const Title = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '24px' : '4vh',
  fontWeight: '600',
  color: '#333',
  marginBottom: '0vh',
}));

const Subtitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.3vh',
  fontWeight: '500',
  color: '#333',
  marginBottom: '2vh',
}));

const InputGroup = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginBottom: '1.5vh',
  textAlign: 'left',
  width: isMobile ? '70vw' : '80%',
}));

const Label = styled.label.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.5vh',
  color: '#555',
  marginBottom: '0.5vh',
  display: 'block',
}));

const Input = styled.input.withConfig({
  shouldForwardProp: (_prop) => true,
})(({ isMobile }) => ({
  width: isMobile ? '100%' : '25vw',
  padding: isMobile ? '1.2vh 2vw' : '1vh 1vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  marginTop: '1vw',
  marginLeft: '1vw',
}));

const ButtonContainer = styled.div(() => ({
  marginTop: '2vh',
  textAlign: 'center',
}));

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '100%' : '20vw',
  padding: isMobile ? '1.2vh 3vw' : '1vh 2vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: '#3b82f6',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  margin: '0.5vh 1vw',
  transition: 'background-color 0.3s, transform 0.1s',
}));

const ModalText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#333',
  textAlign: 'center',
}));

function NavigateToPlay() {
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(`/play/${sessionId}`);
    }
  };

  const handleCloseModal = () => {
    setShowErrorModal(false);
    setError('');
  };

  return (
    <Container>
      <Box isMobile={isMobile}>
        <Title isMobile={isMobile}>Welcome To Play</Title>
        <Subtitle isMobile={isMobile}>Please Enter the Game Session ID:</Subtitle>
        <InputGroup isMobile={isMobile}>
          <Label isMobile={isMobile}>
            Session ID:
            <Input
              isMobile={isMobile}
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              onKeyDown={handleKeyDown}
              type="text"
              aria-label="Game Session ID input"
            />
          </Label>
        </InputGroup>
        <ButtonContainer>
          <Button
            isMobile={isMobile}
            onClick={() => navigate(`/play/${sessionId}`)}
            aria-label="Submit session ID to join game"
          >
            Submit
          </Button>
        </ButtonContainer>
      </Box>

      {showErrorModal && (
        <Modal onClose={handleCloseModal}>
          <ModalText isMobile={isMobile}>{error}</ModalText>
        </Modal>
      )}
    </Container>
  );
}

export default NavigateToPlay;