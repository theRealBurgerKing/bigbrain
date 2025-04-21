import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

function NavigateToPlay() {
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();

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

  // Define styles as named objects
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '40vh',
    width: '100%',
    padding: '0px',
    margin: '0px',
  };

  const boxStyle = {
    width: '30vw',
    padding: '2vh 3vw',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginTop: '20vh',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: '4vh',
    fontWeight: '600',
    color: '#333',
    marginBottom: '0vh',
  };

  const subtitleStyle = {
    fontSize: '1.3vh',
    fontWeight: '500',
    color: '#333',
    marginBottom: '2vh',
  };

  const inputGroupStyle = {
    marginBottom: '1.5vh',
    textAlign: 'left',
  };

  const labelStyle = {
    fontSize: '1.5vh',
    color: '#555',
    marginBottom: '0.5vh',
    display: 'block',
  };

  const inputStyle = {
    width: '20vw',
    padding: '1vh 1vw',
    fontSize: '1.8vh',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    marginTop: '1vw',
    marginLeft: '1vw',
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
        <h1 style={titleStyle}>Welcome To Play</h1>
        <h2 style={subtitleStyle}>Please Enter the Game Session ID:</h2>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
                        Session ID:
            <input
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              onKeyDown={handleKeyDown}
              type="text"
              style={inputStyle}
            />
          </label>
        </div>
        <div style={buttonContainerStyle}>
          <button style={buttonStyle} onClick={() =>navigate(`/play/${sessionId}`)}>
                        Submit
          </button>
        </div>
      </div>

      {showErrorModal && (
        <Modal onClose={handleCloseModal}>
          <p style={modalTextStyle}>{error}</p>
        </Modal>
      )}
    </div>
  );
}

export default NavigateToPlay;