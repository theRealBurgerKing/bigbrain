import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function QuestionEditor() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [text, setText] = useState('');
  const [type, setType] = useState('multiple choice');
  const [duration, setDuration] = useState(30);
  const [points, setPoints] = useState(10);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [image, setImage] = useState('');
  const [answers, setAnswers] = useState(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  // Fetch all games on mount
  const fetchGames = async () => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5005/admin/games', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const gamesData = response.data.games
        ? Object.values(response.data.games).map((game) => ({
            gameId: game.id ? String(game.id) : null,
            owner: game.owner || null,
            name: game.name || 'Untitled Game',
            thumbnail: game.thumbnail || '',
            createdAt: game.createdAt || new Date().toISOString(),
            active: game.active || null,
            questions: Array.isArray(game.questions)
              ? game.questions.map((q, index) => ({
                  id: q.id ? String(q.id) : `${Date.now()}-${index}`,
                  duration: q.duration ? Number(q.duration) : null,
                  points: q.points ? Number(q.points) : 10,
                  correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers.map(String) : [],
                  isCorrect: q.isCorrect !== undefined ? q.isCorrect : false,
                  text: q.text || '',
                  answers: Array.isArray(q.answers) ? q.answers : ['', ''],
                  type: q.type || 'multiple choice',
                  youtubeUrl: q.youtubeUrl || '',
                  image: q.image || '',
                }))
              : [],
          }))
        : [];

      if (response.status === 200) {
        setGames(gamesData);
        const gameData = gamesData.find((g) => g.gameId === gameId);
        if (gameData) {
          setGame(gameData);
          if (questionId) {
            const questionData = gameData.questions.find((q) => q.id === questionId);
            if (questionData) {
              setQuestion(questionData);
              setText(questionData.text);
              setType(questionData.type);
              setDuration(questionData.duration || 30);
              setPoints(questionData.points || 10);
              setYoutubeUrl(questionData.youtubeUrl);
              setImage(questionData.image);
              setAnswers(questionData.answers);
              setCorrectAnswers(questionData.correctAnswers);
              setIsCorrect(questionData.isCorrect);
            } else {
              setError('Question not found.');
            }
          }
        } else {
          setError('Game not found.');
        }
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('myusername');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setError('Forbidden: You do not have permission.');
        } else {
          setError(err.response.data?.error || 'An error occurred.');
        }
      } else {
        setError('Failed to connect to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [gameId, questionId, token, navigate]);

  // Handle add new question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: '',
      answers: ['', ''],
      type: 'multiple choice',
      duration: 30,
      points: 10,
      youtubeUrl: '',
      image: '',
      correctAnswers: [],
      isCorrect: false,
    };

    const updatedGames = games.map((g) =>
      g.gameId === gameId
        ? { ...g, questions: [...g.questions, newQuestion] }
        : g
    );

    setGames(updatedGames);
    updateGames(updatedGames);
    navigate(`/game/${gameId}/question/${newQuestion.id}`);
  };

  // Handle delete question
  const handleDeleteQuestion = (questionId) => {
    //console.log('Deleting question with ID:', questionId, 'Type:', typeof questionId);
    //console.log('Current questions:', game.questions);
    const updatedGames = games.map((g) =>
      g.gameId === gameId
        ? {
            ...g,
            questions: g.questions.filter((q) => {
              //console.log('Comparing q.id:', q.id, 'with questionId:', questionId, 'Result:', q.id !== questionId);
              return q.id !== questionId;
            }),
          }
        : g
    );
    //console.log('After deletion, updated games:', updatedGames);
    setGames(updatedGames);
    updateGames(updatedGames);
    fetchGames();
  };

  // Handle edit question navigation
  const handleEditQuestion = (questionId) => {
    console.log("press!");
    navigate(`/game/${gameId}/question/${questionId}`);
  };

  // Handle answer change
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Add new answer option
  const addAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, '']);
    } else {
      setError('Maximum 6 answers allowed.');
    }
  };

  // Remove answer option
  const removeAnswer = (index) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
      setCorrectAnswers(correctAnswers.filter((answerIndex) => answerIndex !== index.toString()));
    } else {
      setError('Minimum 2 answers required.');
    }
  };

  // Handle correct answer toggle (for multiple choice and single choice)
  const toggleCorrectAnswer = (index) => {
    if (type === 'single choice') {
      setCorrectAnswers([index.toString()]);
    } else if (type === 'multiple choice') {
      if (correctAnswers.includes(index.toString())) {
        setCorrectAnswers(correctAnswers.filter((i) => i !== index.toString()));
      } else {
        setCorrectAnswers([...correctAnswers, index.toString()]);
      }
    }
  };

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

  // Update games on the backend
  const updateGames = async (updatedGames) => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    try {
      const response = await axios.put(
        'http://localhost:5005/admin/games',
        { games: updatedGames },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        setGames(updatedGames);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('myusername');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setError('Forbidden: You do not have permission to update this game.');
        } else {
          setError(err.response.data?.error || 'An error occurred while updating the game.');
        }
      } else {
        setError('Failed to connect to the server.');
      }
    }
  };

  // Handle save question
  const handleSave = async () => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!text.trim()) {
      setError('Question text is required.');
      return;
    }

    if (duration < 1) {
      setError('Time limit must be at least 1 second.');
      return;
    }

    if (points < 1) {
      setError('Points must be at least 1.');
      return;
    }

    if (answers.length < 2 || answers.length > 6) {
      setError('Answers must be between 2 and 6.');
      return;
    }

    if (type === 'single choice' && correctAnswers.length !== 1) {
      setError('Single choice questions must have exactly one correct answer.');
      return;
    }

    if (type === 'multiple choice' && correctAnswers.length < 1) {
      setError('Multiple choice questions must have at least one correct answer.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedGames = games.map((g) =>
        g.gameId === gameId
          ? {
              ...g,
              questions: g.questions.map((q) =>
                q.id === questionId
                  ? {
                      id: q.id,
                      text: text,
                      type: type,
                      duration: Number(duration),
                      points: Number(points),
                      youtubeUrl: youtubeUrl,
                      image: image,
                      answers: answers,
                      correctAnswers: type !== 'judgement' ? correctAnswers : [],
                      isCorrect: type === 'judgement' ? isCorrect : false,
                    }
                  : q
              ),
            }
          : g
      );

      await updateGames(updatedGames);
      navigate(`/game/${gameId}/questions`);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('myusername');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setError('Forbidden: You do not have permission to update this game.');
        } else {
          setError(err.response.data?.error || 'An error occurred while updating the question.');
        }
      } else {
        setError('Failed to connect to the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  // If no questionId is provided, show the question list
  if (!questionId) {
    if (!game) return <div>Game not found.</div>;

    return (
      <div style={{ padding: '20px' }}>
        <h2>Questions for Game: {game.name}</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleAddQuestion}
            style={{ padding: '5px 10px', marginBottom: '10px' }}
          >
            Add Question
          </button>
          {game.questions.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {game.questions.map((q) => (
                <li
                  key={q.id}
                  style={{
                    padding: '5px',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span onClick={() => {
                    handleEditQuestion(q.id)}}>
                    {q.text || 'Untitled Question'}
                  </span>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    style={{ color: 'red' }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No questions yet. Click "Add Question" to start.</p>
          )}
        </div>

        <button
          onClick={() => navigate(`/game/${gameId}`)}
          style={{ padding: '10px 20px' }}
        >
          Back to Game Editor
        </button>
      </div>
    );
  }

  // If questionId is provided, show the question editor
  if (!question) return <div>Question not found.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Question</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div style={{ marginBottom: '20px' }}>
        <label>
          Question Type:
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCorrectAnswers([]);
              setIsCorrect(false);
            }}
            style={{ marginLeft: '10px' }}
          >
            <option value="multiple choice">Multiple Choice</option>
            <option value="single choice">Single Choice</option>
            <option value="judgement">Judgement</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Question:
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter question"
            style={{ marginLeft: '10px', width: '300px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Time Limit (seconds):
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            style={{ marginLeft: '10px', width: '100px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Points:
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            min="1"
            style={{ marginLeft: '10px', width: '100px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          YouTube URL (optional):
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            style={{ marginLeft: '10px', width: '300px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
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
            style={{ maxWidth: '100px', marginTop: '10px' }}
          />
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Answers (2-6)</h3>
        {answers.map((answer, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <label>
              Answer {index + 1}:
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                style={{ marginLeft: '10px', width: '200px' }}
              />
            </label>
            {type !== 'judgement' ? (
              <label style={{ marginLeft: '10px' }}>
                <input
                  type={type === 'single choice' ? 'radio' : 'checkbox'}
                  checked={correctAnswers.includes(index.toString())}
                  onChange={() => toggleCorrectAnswer(index)}
                />
                Correct
              </label>
            ) : null}
            <button
              onClick={() => removeAnswer(index)}
              style={{ marginLeft: '10px', color: 'red' }}
              disabled={answers.length <= 2}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addAnswer}
          disabled={answers.length >= 6}
          style={{ padding: '5px 10px' }}
        >
          Add Answer
        </button>
      </div>

      {type === 'judgement' && (
        <div style={{ marginBottom: '20px' }}>
          <label>
            Is Correct:
            <input
              type="checkbox"
              checked={isCorrect}
              onChange={(e) => setIsCorrect(e.target.checked)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
      )}

      <div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => navigate(`/game/${gameId}/questions`)}
          style={{ padding: '10px 20px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default QuestionEditor;