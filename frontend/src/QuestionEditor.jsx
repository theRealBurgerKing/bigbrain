import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function QuestionEditor() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);

  // Question state
  const [type, setType] = useState('multiple choice');
  const [text, setText] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(10);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [image, setImage] = useState('');
  const [answers, setAnswers] = useState(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  // Fetch game data on mount
  useEffect(() => {
    console.log('Token:', token); // Debug
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const fetchGame = async () => {
      setIsLoading(true);
      setError('');
      try {
        console.log('Fetching games for gameId:', gameId, 'questionId:', questionId);
        const response = await axios.get('http://localhost:5005/admin/games', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Raw response:', response.data);
        if (response.status === 200) {
          const games = Array.isArray(response.data.games)
            ? response.data.games
            : Object.keys(response.data.games).map((id) => ({
                id,
                ...response.data.games[id],
              }));
          console.log('Normalized games:', games);
          const gameData = games.find((g) => g.id.toString() === gameId);
          if (gameData) {
            setGame(gameData);
            const questionData = gameData.questions.find(
              (q) => q.id.toString() === questionId
            );
            if (questionData) {
              setQuestion(questionData);
              setType(questionData.type || 'multiple choice');
              setText(questionData.text || '');
              setTimeLimit(questionData.timeLimit || 30);
              setPoints(questionData.points || 10);
              setYoutubeUrl(questionData.youtubeUrl || '');
              setImage(questionData.image || '');
              setAnswers(
                Array.isArray(questionData.answers) && questionData.answers.length >= 2
                  ? questionData.answers
                  : ['', '']
              );
              setCorrectAnswers(
                Array.isArray(questionData.correctAnswers)
                  ? questionData.correctAnswers
                  : []
              );
              setIsCorrect(questionData.isCorrect || false);
              console.log('Loaded question:', questionData);
            } else {
              setError('Question not found.');
            }
          } else {
            setError('Game not found.');
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response) {
          if (err.response.status === 401) {
            setError('Session expired. Please log in again.');
            localStorage.removeItem('token');
            setTimeout(() => navigate('/login'), 2000);
          } else if (err.response.status === 403) {
            setError('Forbidden: You do not have permission.');
          } else {
            setError(err.response.data?.error || 'An error occurred.');
          }
        } else {
          setError('Failed to connect to the server. Please ensure the backend is running on http://localhost:5005.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId, questionId, token, navigate]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add or remove answers (2-6)
  const addAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, '']);
    }
  };

  const removeAnswer = (index) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
      if (type !== 'judgement') {
        setCorrectAnswers(correctAnswers.filter((_, i) => i !== index));
      }
    }
  };

  // Toggle correct answer for single/multiple choice
  const toggleCorrectAnswer = (index) => {
    if (type === 'single choice') {
      setCorrectAnswers([index]);
    } else if (type === 'multiple choice') {
      if (correctAnswers.includes(index)) {
        setCorrectAnswers(correctAnswers.filter((i) => i !== index));
      } else {
        setCorrectAnswers([...correctAnswers, index]);
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!text) {
      setError('Question text is required.');
      return;
    }
    if (type !== 'judgement' && answers.length < 2) {
      setError('At least 2 answers are required for single/multiple choice questions.');
      return;
    }
    if (type !== 'judgement' && correctAnswers.length === 0) {
      setError('At least one correct answer must be selected.');
      return;
    }
    if (timeLimit <= 0) {
      setError('Time limit must be greater than 0.');
      return;
    }
    if (points <= 0) {
      setError('Points must be greater than 0.');
      return;
    }

    const updatedQuestion = {
      ...question,
      type,
      text,
      timeLimit,
      points,
      youtubeUrl,
      image: image || undefined,
      answers: type === 'judgement' ? [isCorrect ? 'True' : 'False'] : answers,
      correctAnswers: type !== 'judgement' ? correctAnswers : undefined,
      isCorrect: type === 'judgement' ? isCorrect : undefined,
    };

    const updatedQuestions = game.questions.map((q) =>
      q.id.toString() === questionId ? updatedQuestion : q
    );
    const updatedGame = {
      ...game,
      questions: updatedQuestions,
    };

    try {
      setIsLoading(true);
      const response = await axios.put(
        'http://localhost:5005/admin/games',
        {
          games: [updatedGame],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        alert('Question updated successfully!');
        navigate(`/game/${gameId}`);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setError('Forbidden: You do not have permission.');
        } else {
          setError(err.response.data?.error || 'An error occurred.');
        }
      } else {
        setError('Failed to connect to the server. Please ensure the backend is running on http://localhost:5005.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Question</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {isLoading && !game ? (
        <div>Loading...</div>
      ) : !game || !question ? (
        <div>Question not found.</div>
      ) : (
        <>
          {/* Question Type */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Question Type:
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setCorrectAnswers([]);
                  if (e.target.value === 'judgement') {
                    setAnswers(['True', 'False']);
                  } else {
                    setAnswers(['', '']);
                  }
                }}
                style={{ marginLeft: '10px' }}
              >
                <option value="multiple choice">Multiple Choice</option>
                <option value="single choice">Single Choice</option>
                <option value="judgement">Judgement</option>
              </select>
            </label>
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Question Text:
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ width: '100%', marginTop: '5px' }}
              />
            </label>
          </div>

          {/* Time Limit */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Time Limit (seconds):
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                min="1"
                style={{ marginLeft: '10px', width: '100px' }}
              />
            </label>
          </div>

          {/* Points */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Points:
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min="1"
                style={{ marginLeft: '10px', width: '100px' }}
              />
            </label>
          </div>

          {/* YouTube URL */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              YouTube URL (optional):
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ width: '100%', marginTop: '5px' }}
              />
            </label>
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Image (optional):
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ marginLeft: '10px' }}
              />
            </label>
            {image && (
              <img
                src={image}
                alt="Question image"
                style={{ maxWidth: '200px', marginTop: '10px' }}
              />
            )}
          </div>

          {/* Answers */}
          <div style={{ marginBottom: '10px' }}>
            <h4>Answers</h4>
            {type === 'judgement' ? (
              <div>
                <label>
                  Correct Answer:
                  <select
                    value={isCorrect ? 'True' : 'False'}
                    onChange={(e) => setIsCorrect(e.target.value === 'True')}
                    style={{ marginLeft: '10px' }}
                  >
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </label>
              </div>
            ) : (
              <>
                {answers.map((answer, index) => (
                  <div key={index} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                    <label style={{ flex: 1 }}>
                      Answer {index + 1}:
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => {
                          const newAnswers = [...answers];
                          newAnswers[index] = e.target.value;
                          setAnswers(newAnswers);
                        }}
                        style={{ marginLeft: '10px', width: '300px' }}
                      />
                    </label>
                    <label style={{ marginLeft: '10px' }}>
                      Correct:
                      <input
                        type={type === 'single choice' ? 'radio' : 'checkbox'}
                        name={type === 'single choice' ? 'correctAnswer' : undefined}
                        checked={correctAnswers.includes(index)}
                        onChange={() => toggleCorrectAnswer(index)}
                        style={{ marginLeft: '5px' }}
                      />
                    </label>
                    {answers.length > 2 && (
                      <button
                        onClick={() => removeAnswer(index)}
                        style={{ marginLeft: '10px', color: 'red' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {answers.length < 6 && (
                  <button onClick={addAnswer} style={{ marginTop: '10px' }}>
                    Add Answer
                  </button>
                )}
              </>
            )}
          </div>

          {/* Save and Cancel */}
          <div>
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{ padding: '10px 20px', marginRight: '10px' }}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => navigate(`/game/${gameId}`)}
              style={{ padding: '10px 20px' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default QuestionEditor;