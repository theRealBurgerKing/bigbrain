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
    const [questions, setQuestions] = useState([]);
    const [question, setQuestion] = useState({});
    const [timeLeft, setTimeLeft] = useState(-1);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const prevActiveRef = useRef(active);
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Initialize to 0

    const attendGame = async () => {
        try {
            const response = await axios.post(
                `http://localhost:5005/play/join/${sessionId}/`,
                { "name": player }
            );
            if (response.status === 200) {
                console.log(response.data);
                setPlayerId(response.data.playerId);
            }
        } catch (err) {
            console.log(err);
            if (err.response) {
                if (err.response.status === 400) {
                    setError(err.response.data.error);
                    setTimeout(() => navigate('/play'), 2000);
                    return () => clearTimeout(timeout);
                } else {
                    setError(err.response);
                }
            }
        }
    };

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
                setActive(response.data.started);
            }
        } catch (err) {
            console.log(err);
            if (err.response) {
                if (err.response.data.error === "Session ID is not an active session") {
                    setActive(false);
                    setFinish(true);
                }
            } else {
                setError(err.response.data.error);
                setTimeout(() => navigate('/play'), 2000);
                return () => clearTimeout(timeout);
            }
        }
    };

    const fetchAnswer = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5005/play/${playerId}/answer`
            );
            if (response.status === 200) {
                setCorrectAnswers(response.data.answers);
            }
        } catch (err) {
            console.log(err);
            if (err.response) {
                setError(err.response.data.error);
            }
        }
    };

    const fetchQuestion = async () => {
        try {
            console.log('Fetching question for sessionId:', sessionId);
            const q = await axios.get(
                `http://localhost:5005/play/${playerId}/question`
            );
            console.log('Fetched question:', q.data);
            if (q.status === 200) {
                setQuestions(prevQuestions => {
                    if (!prevQuestions.some(existingQuestion => existingQuestion.id === q.data.question.id)) {
                        const updatedQuestions = [...prevQuestions, q.data.question];
                        console.log('Updated questions:', updatedQuestions);
                        setQuestion(q.data.question);
                        return updatedQuestions;
                    } else {
                        setQuestion(q.data.question);
                        return prevQuestions;
                    }
                });

                const startTime = new Date(q.data.question.isoTimeLastQuestionStarted).getTime();
                const duration = q.data.question.duration * 1000;
                const now = Date.now();
                const remainingTime = Math.max(0, Math.floor((startTime + duration - now) / 1000));
                setTimeLeft(remainingTime);
                if (remainingTime === 0) {
                    fetchAnswer();
                }
            }
        } catch (err) {
            console.log('Error fetching question:', err);
            if (err.response) {
                setError(err.response.data.error);
            }
        }
    };

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
        setError('');
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
            console.log(err);
            if (err.response) {
                setError(err.response.data.error);
            }
        }
    };

    const fetchScore = async () => {
        setResults('');
        try {
            const response = await axios.get(
                `http://localhost:5005/play/${playerId}/results`
            );
            if (response.status === 200) {
                let sumScore = 0;
                response.data.forEach((ans, index) => {
                    const questionStartTime = new Date(ans.questionStartedAt);
                    const answerTime = new Date(ans.answeredAt);
                    const timeDifference = ((answerTime - questionStartTime) / 1000).toFixed(2);
                    const score = Math.log10(1 + timeDifference) * questions[index].points;

                    const result = {
                        questionId: questions[index].id,
                        timeDifference: timeDifference,
                        score: score.toFixed(2),
                        correct: ans.correct,
                    };
                    if (ans.correct) {
                        sumScore += score;
                    }
                    setResults(prevResults => [...prevResults, result]);
                });
                setTotal(sumScore.toFixed(2));
            }
        } catch (err) {
            console.log(err);
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
    }, [playerId, finish]);

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
            fetchScore();
        }
        prevActiveRef.current = active;
    }, [active]);

    useEffect(() => {
        if (question && question.id) {
            // Update the current question index based on the questions array length
            setCurrentQuestionIndex(questions.length + 1);
            setSelectedAnswers([]);
            setCorrectAnswers([]);
        }
    }, [question.id, questions]); // Trigger when question.id changes

    // Define styles as named objects
    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        minHeight: '40vh',
        width: '100%',
        padding: '0px',
        margin: '0px',
        marginTop: '20vh',
    };

    const boxStyle = {
        width: '30vw',
        padding: '2vh 3vw',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        margin: '2vh 0',
    };

    const titleStyle = {
        fontSize: '3vh',
        fontWeight: '600',
        color: '#333',
        marginBottom: '2vh',
    };

    const subtitleStyle = {
        fontSize: '2.5vh',
        fontWeight: '500',
        color: '#333',
        marginBottom: '2vh',
        textAlign: 'left',
    };

    const textStyle = {
        fontSize: '1.8vh',
        color: '#555',
        marginBottom: '0.5vh',
    };

    const errorStyle = {
        color: 'red',
        fontSize: '1.8vh',
        marginBottom: '1vh',
        textAlign: 'center',
    };

    const inputGroupStyle = {
        marginBottom: '1.5vh',
        textAlign: 'left',
    };

    const labelStyle = {
        fontSize: '1.5vh',
        color: '#555',
        marginBottom: '0.5vh',
        marginTop: '5vh',
        display: 'block',
    };

    const inputStyle = {
        width: '25vw',
        padding: '1vh 1vw',
        fontSize: '1.8vh',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff',
        marginLeft: '1vw',
    };

    const answerListStyle = {
        listStyle: 'none',
        padding: '0',
        margin: '0',
    };

    const answerItemStyle = {
        padding: '1vh 1vw',
        borderRadius: '5px',
        marginBottom: '0.5vh',
    };

    const correctAnswerStyle = {
        backgroundColor: 'lightgreen',
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

    const disabledButtonStyle = {
        padding: '1vh 2vw',
        fontSize: '1.8vh',
        fontWeight: '500',
        color: '#fff',
        backgroundColor: '#a3bffa',
        border: 'none',
        borderRadius: '4px',
        cursor: 'not-allowed',
        margin: '0.5vh 1vw',
    };

    const resultListStyle = {
        listStyle: 'none',
        padding: '0',
        margin: '0',
    };

    const resultItemStyle = {
        padding: '1vh 1vw',
        marginBottom: '0.5vh',
        borderBottom: '1px solid #eee',
    };

    return (
        <div style={containerStyle}>
            <div style={boxStyle}>
                <h1 style={titleStyle}>Play Ground</h1>
                {error && <div style={errorStyle}>{error}</div>}

                {!playerId && (
                    <div style={inputGroupStyle}>
                        <h2 style={subtitleStyle}>Game: {sessionId || 'Unknown'}</h2>
                        <label style={labelStyle}>
                            Name:
                            <input
                                value={player}
                                onChange={(e) => setPlayer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                type="text"
                                style={inputStyle}
                            />
                        </label>
                        <div style={buttonContainerStyle}>
                            <button style={buttonStyle} onClick={attendGame}>
                                Attend the game!
                            </button>
                        </div>
                    </div>
                )}

                {playerId && question && !finish && (
                    <>
                        <h2 style={subtitleStyle}>
                            {active ? `Question ${currentQuestionIndex}: ${question.text}` : 'Waiting'}
                        </h2>
                    </>
                )}

                {playerId && active && question && question.answers && (
                    <>
                        <div style={textStyle}>
                            URL: <a href={question.youtubeUrl} style={{ color: '#3b82f6' }}>{question.youtubeUrl}</a>
                        </div>
                        <div style={textStyle}>
                            Score: {question.points}
                        </div>
                        <div style={textStyle}>
                            Time: {timeLeft}
                        </div>
                        {question.answers.length > 0 ? (
                            <ul style={answerListStyle}>
                                {question.answers.map((ans, index) => {
                                    const indexStr = index.toString();
                                    const isCorrect = correctAnswers?.includes(indexStr);
                                    return (
                                        <li
                                            key={index}
                                            style={{
                                                ...answerItemStyle,
                                                ...(isCorrect ? correctAnswerStyle : {}),
                                            }}
                                        >
                                            {index}: {ans}
                                            <input
                                                type={question.type === 'multiple choice' ? 'checkbox' : 'radio'}
                                                name="ans"
                                                checked={selectedAnswers.includes(indexStr)}
                                                onChange={() => handleAnswerSelect(indexStr)}
                                                disabled={timeLeft <= 0}
                                                style={{ marginLeft: '1vw' }}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p style={textStyle}>No questions yet.</p>
                        )}
                        <div style={buttonContainerStyle}>
                            <button
                                style={timeLeft <= 0 ? disabledButtonStyle : buttonStyle}
                                onClick={() => submitQuestion()}
                                disabled={timeLeft <= 0}
                            >
                                Submit
                            </button>
                        </div>
                    </>
                )}

                {finish && (
                    <>
                        <h2 style={subtitleStyle}>Result</h2>
                        <p style={textStyle}>
                            <strong>Your score = Σ(lg(1 + timelimit - time that you use) * score)</strong>
                        </p>
                        {Array.isArray(results) && results.length > 0 ? (
                            <ul style={resultListStyle}>
                                {results.map((r, index) => (
                                    <li key={index} style={resultItemStyle}>
                                        Question: {index + 1} : {r.correct ? 'True' : 'False'}
                                        <br />
                                        Time cost: {r.timeDifference}s
                                        <br />
                                        Your score is {r.score}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={textStyle}>No results available.</p>
                        )}
                        <p style={textStyle}>Total: {total}</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default PlayGround;