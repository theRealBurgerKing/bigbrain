import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function GameSession() {
    const location = useLocation();
    const gameId = location.state?.gameId;

    const { sessionId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [error, setError] = useState('');
    const [session, setSession] = useState(null);

    const fetchSession = async () => {
        console.log(sessionId);
        if (!token) {
            setError('No token found. Please log in again.');
            setTimeout(() => navigate('/login'), 2000);
            return () => clearTimeout(timeout);
        }
        try {
            const response = await axios.get(`http://localhost:5005/admin/session/${sessionId}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                setSession(response.data.results);
            }
        } catch (err) {
            console.log(err)
            if (err.response) {
                if (err.response.status === 500) {
                    setError('No such session is ON.')
                    setTimeout(() => navigate('/dashboard'), 2000);
                    return () => clearTimeout(timeout);
                } else {
                    setError(err.response.data.error);
                }
            }
        } finally {
            console.log('finally');
        }
    }

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
                console.log(response.data)
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error);
            } else {
                console.log(err)
                setError('Failed to connect to the server. Please try again.');
            }
        } finally {
            fetchSession();
        }
    }

    // Fetch data on mount
    useEffect(() => {
        fetchSession(sessionId);
    }, []);


    return (
        <div>
            HI
            <button onClick={() => { console.log(session) }}>Test</button> <br />
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} <br />

            {session ? (
                <>
                    <strong>Game ID:</strong> {gameId} <br />
                    <strong>ID:</strong> {sessionId} <br />
                    <strong>POS:</strong> {session.position} <br />
                    <strong>All Question:</strong> {Object.keys(session.questions).length} <br />

                    <strong>Last Question:</strong>{' '}
                    {new Date(session.isoTimeLastQuestionStarted).toLocaleString()} <br />

                    <strong>answerAvailable:</strong> {session.answerAvailable ? 'Yes' : 'No'} <br />
                </>
            ) : (
                <p>No status</p>
            )
            }
            <button onClick={() => nextQuestion(gameId)}>Next</button> <br />
            <button onClick={() => { navigate('/dashboard') }}>Back</button> <br />

        </div>
    );
}

export default GameSession;