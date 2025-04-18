import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PlayGround() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { sessionId } = useParams();
    const [error, setError] = useState('');
    const [player, setPlayer] = useState('');
    const [playerId, setPlayerId] = useState(searchParams.get('playerId'));
    const [active, setActive] = useState(false);
    const [finish, setFinish] = useState(false);
    const [question, setQuestion] = useState({});
    const [timeLeft, setTimeLeft] = useState(-1);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const prevActiveRef = useRef(active);
    const [results, setResults] = useState([]);

    const attendGame = async () => {
        try {
            const response = await axios.post(
                `http://localhost:5005/play/join/${sessionId}/`,
                { "name": player }
            );
            if (response.status === 200) {
                console.log(response.data)
                setPlayerId(response.data.playerId)
            }
        } catch (err) {
            console.log(err)
            if (err.response) {
                if (err.response.status === 400) {
                    setError(err.response.data.error)
                    setTimeout(() => navigate('/play'), 2000);
                    return () => clearTimeout(timeout);
                } else {
                    setError(err.response);
                }
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            attendGame();
        }
    };

    const fetchActive = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5005/play/${playerId}/status`
            );
            if (response.status === 200) {
                setActive(response.data.started)
            }
        }
        catch (err) {
            console.log(err)
            if (err.response) {
                if (err.response.data.error === "Session ID is not an active session") {
                    setActive(false);
                    setFinish(true); 
                }
            }else{
                setError(err.response.data.error);
                setTimeout(() => navigate('/play'), 2000);
                return () => clearTimeout(timeout);
            }
        }
    };

    const fetchanswer = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5005/play/${playerId}/answer`
            );
            if (response.status === 200) {
                setCorrectAnswers(response.data.answers)
            }
        } catch (err) {
            console.log(err)
            if (err.response) {
                setError(err.response.data.error);
            }
        }
    };

    const fetchQuestion = async () => {
        try {
            const q = await axios.get(
                `http://localhost:5005/play/${playerId}/question`
            );
            if (q.status === 200) {
                setQuestion(q.data.question);
                const startTime = new Date(q.data.question.isoTimeLastQuestionStarted).getTime();
                const duration = q.data.question.duration * 1000;
                const now = Date.now();
                const remainingTime = Math.max(0, Math.floor((startTime + duration - now) / 1000));
                setTimeLeft(remainingTime);
                if (remainingTime == 0) {
                    fetchanswer();
                }
            }
        } catch (err) {
            console.log(err)
            if (err.response) {
                setError(err.response.data.error);
                // setTimeout(() => navigate('/play'), 2000);
                // return () => clearTimeout(timeout);
            }
        }
    }

    const handleAnswerSelect = (index) => {
        const strIndex = index.toString();
        if (question.type === 'multiple choice') {
            setSelectedAnswers((prev) => {
                let updated;
                if (prev.includes(strIndex)) {
                    updated = prev.filter((i) => i !== strIndex);
                } else {
                    updated = [...prev, strIndex];
                }
                return updated.sort((a, b) => Number(a) - Number(b));
            });
        } else {
            setSelectedAnswers([index.toString()]);
        }
    };

    const submitQuestion = async () => {
        setError('')
        try {
            const q = await axios.put(
                `http://localhost:5005/play/${playerId}/answer`,
                {
                    "answers": selectedAnswers
                }
            );
            if (q.status === 200) {
                console.log('ok');
            }
        } catch (err) {
            console.log(err)
            if (err.response) {
                setError(err.response.data.error);
            }
        }
    };

    const fetchscore = async () =>{
        try {
            const response = await axios.get(
                `http://localhost:5005/play/${playerId}/results`
            );
            if (response.status === 200) {
                setResults(response.data)
                console.log(response.data)
            }
        } catch (err) {
            console.log(err)
            if (err.response) {
                setError(err.response.data.error);
            }
        }
    };


    useEffect(() => {
        if (!playerId || finish) return;
        const intervalId = setInterval(() => {
            fetchActive();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [playerId,finish]);
    
    useEffect(() => {
        if (!active) return;
        const intervalId = setInterval(() => {
            setError('');
            fetchQuestion();
        }, 1000);
    
        return () => clearInterval(intervalId);
    }, [active]);

    useEffect(() => {
        if (prevActiveRef.current && !active) {
            console.log("Game ended.");
            setError('');
            fetchscore();
        }
        prevActiveRef.current = active;
    }, [active]);


    useEffect(() => {
        if (question && question.id) {
            setSelectedAnswers([]);
            setCorrectAnswers([]);
        }
    }, [question.id]);



    return (
        <div>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>} <br />
            <h1>Play Ground</h1>
            {!playerId && (
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
            {playerId && question && !finish &&(
                <>
                    <h2>{active ? question.text : 'Waiting'}</h2>
                </>

            )}
            {playerId && active && question && question.answers && (
                <>
                    <p>url:<a href={question.youtubeUrl}></a></p>
                    <p>Time:{timeLeft}</p>
                    {question.answers.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {question.answers.map((ans, index) => {
                                const indexStr = index.toString();
                                let isCorrect = correctAnswers?.includes(indexStr);

                                return(
                                    <li
                                        key={index}
                                        style={{
                                            backgroundColor: isCorrect ? 'lightgreen' : 'transparent',
                                            padding: '5px',
                                            borderRadius: '5px',
                                        }}
                                    >
                                    {index}:{ans}
                                    <input
                                        type={question.type === 'multiple choice' ? 'checkbox' : 'radio'}
                                        name="ans"
                                        checked={selectedAnswers.includes(indexStr)}
                                        onChange={() => handleAnswerSelect(indexStr)}
                                    />
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p>No questions yet.</p>
                    )}
                    <button
                        onClick={() => submitQuestion()}
                    // disabled={timeLeft <= 0}
                    >
                        Submit
                    </button>
                </>

            )}
            {finish &&(
                <>
                    <h2>Result</h2>

                </>
            )}
        </div>
    );
}

export default PlayGround;