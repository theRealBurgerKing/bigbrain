import { Link } from 'react-router-dom';

function HomePage() {
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
    width: '50vw',
    padding: '2vh 3vw',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    margin: '2vh 0',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: '6vh',
    fontWeight: '600',
    color: '#333',
    marginBottom: '6vh',
  };

  const textStyle = {
    fontSize: '1.8vh',
    color: '#555',
    marginBottom: '2vh',
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
    textDecoration: 'none', // Ensure Link buttons have no underline
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <h1 style={titleStyle}>Welcome to BigBrain Platform</h1>
        <p style={textStyle}>Please login or register to start playing!</p>
        <div style={buttonContainerStyle}>
          <Link to="/login" style={buttonStyle}>
                        Login
          </Link>
          <Link to="/register" style={buttonStyle}>
                        Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;