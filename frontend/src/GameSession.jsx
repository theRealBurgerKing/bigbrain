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
    const [active, setActive] =useState(true);
    const [showResults,setShowResults]=useState(false);
    const [showResultsOrNot,setShowResultsOrNot]=useState(false);
    const resultsShownRef = useRef(false);
    const[results, setResults] =useState([]);
    


    const fetchSession = async () => {
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
                setActive(response.data.results.active);
                if (response.data.results.position >= 0 && response.data.results.active){
                    const startTime = new Date(response.data.results.isoTimeLastQuestionStarted).getTime();
                    const duration = response.data.results.questions[response.data.results.position].duration * 1000;
                    const now = Date.now();
                    setTimeLeft(Math.max(0, Math.floor((startTime + duration - now) / 1000)));
                }
                if(!response.data.results.active && !resultsShownRef.current){
                    resultsShownRef.current = true;
                    setShowResultsOrNot(true);
                }
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

    const getResults =async(q)=>{
        try {
            const response = await axios.get(
                `http://localhost:5005/admin/session/${q}/results`,
                {headers: { Authorization: `Bearer ${token}` }}
            );
            if (response.status === 200) {
                console.log(response.data)
                setResults(response.data)
            }
        } catch (err) {
            console.log(err)
        }

        setShowResults(true)
    };

    // Fetch data on mount
    useEffect(() => {
        if (!active) return;

        const intervalId = setInterval(() => {
          fetchSession();
        }, 1000);
    
        return () => clearInterval(intervalId);
      }, []);


    return (
        <div>
            HI
            <button onClick={() => { fetchSession; console.log(session); }}>Test</button> <br />
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} <br />

            {session ? (
                <>
                    <strong>Active:</strong> {session.active ? 'On going' : 'Game Finish'}<br/>
                    <strong>Game ID:</strong> {gameId} <br />
                    <strong>ID:</strong> {sessionId} <br />
                    
                    <strong>All Question:</strong> {Object.keys(session.questions).length} <br />
                    <strong>Now question:</strong> {session.position === -1 ? 'Waiting for start' : `question ${session.position + 1}`} <br />

                    {timeLeft !== 0 ? (
                        <div>Question Time Last:{timeLeft} 秒</div>
                    ) : (
                        <div>Waiting for next game...</div>
                    )}<br />

                    <strong>answerAvailable:</strong> {session.answerAvailable ? 'Yes' : 'No'} <br />
                </>
            ) : (
                <p>No status</p>
            )
            }
            {/* <button onClick={() => setShowResults(true)}>Results</button> */}
            <button onClick={() => nextQuestion(gameId)}>Next</button> <br />
            <button onClick={() => navigate('/dashboard')}>Back</button> <br />

            {showResultsOrNot && (
                <Modal onClose={() => setShowResultsOrNot(false)}>
                    <p>showResults?</p>
                    <button onClick={() => {
                        getResults(sessionId);
                        }}>Y
                    </button>
                    <button onClick={() => navigate('/dashboard')}>No</button>
                </Modal>
            )}
            {showResults &&(
                <Modal onClose={() => setShowResults(false)}>
                    <Results data={results} question={question}>
                    </Results>
                </Modal>
            )}

        </div>
        
    );
}

export default GameSession;