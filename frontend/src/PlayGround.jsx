import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams} from 'react-router-dom';
import axios from 'axios';

function PlayGround() {
    const { sessionId } = useParams();
    const [error, setError] = useState('');
    const [player, setPlayer] = useState('');
    const [playerId, setPlayerId] = useState(null);

    const attendGame = async () => {



        console.log(player)
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          attendGame();
        }
    };



    return (
        <div>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} <br />
            <h1>Play Ground</h1>
            {!playerId &&(
                <>
                    <div>
                        <h2>Game:{sessionId}</h2>
                        Name: <input
                        value={player}
                        onChange={(e) => setPlayer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        type="text"
                        /><br />
                    </div>
                    <button onClick={attendGame}>Attend the game!</button>
                </>
            )}
        </div>
    );
}

export default PlayGround;