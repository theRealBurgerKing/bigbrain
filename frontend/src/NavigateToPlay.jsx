import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function NavigateToPlay() {
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState('');
    const navigate = useNavigate();

    const navTo=() =>{
        navigate(`/play/${sessionId}`);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          navTo();
        }
    };



    return (
        <div>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} <br />
            <h1>Welcome To Play</h1>
            <h2>Please Enter the Game Session ID:</h2>
            SessionId: <input
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="text"
                        /><br />
                        <button onClick={navTo}>Submit</button>
        </div>
    );
}

export default NavigateToPlay;