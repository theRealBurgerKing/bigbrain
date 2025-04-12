import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function GameEditor() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [game, setGame] = useState(null);
  const [gameName, setGameName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '']);

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
        console.log('Fetching game with ID:', gameId); // Debug
        const response = await axios.get('http://localhost:5005/admin/games', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Response:', response.data); // Debug
        if (response.status === 200) {
          const gameData = response.data.games.find(
            (g) => g.id.toString() === gameId
          );
          if (gameData) {
            setGame(gameData);
            setGameName(gameData.name);
            setThumbnail(gameData.thumbnail || '');
            setQuestions(
              gameData.questions.length > 0
                ? gameData.questions
                : [{ id: Date.now(), text: '', answers: ['', ''] }]
            );
          } else {
            setError('Game not found.');
          }
        }
      } catch (err) {
        console.error('Fetch error:', err); // Debug
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId, token, navigate]);

  // Handle errors consistently
  const handleError = (err) => {
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
      setError('Failed to connect to the server.');
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select a question to edit
  const selectQuestion = (question) => {
    setSelectedQuestion(question);
    setQuestionText(question.text);
    setAnswers(question.answers || ['', '']);
  };

  // Add a new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      answers: ['', ''],
    };
    setQuestions([...questions, newQuestion]);
    selectQuestion(newQuestion);
  };

  // Delete a question
  const deleteQuestion = (questionId) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
      setQuestionText('');
      setAnswers(['', '']);
    }
  };

  // Update selected question
  const updateQuestion = () => {
    if (!selectedQuestion) return;
    const updatedQuestions = questions.map((q) =>
      q.id === selectedQuestion.id
        ? { ...q, text: questionText, answers }
        : q
    );
    setQuestions(updatedQuestions);
    setSelectedQuestion({ ...selectedQuestion, text: questionText, answers });
  };

  // Save game changes
  const saveGame = async () => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedGame = {
        ...game,
        name: gameName,
        thumbnail: thumbnail || undefined,
        questions,
      };
      console.log('Saving game:', updatedGame); // Debug
      const response = await axios.put(
        'http://localhost:5005/admin/games',
        { games: [updatedGame] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        alert('Game updated successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Save error:', err); // Debug
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Game: {gameName}</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {isLoading && !game ? (
        <div>Loading...</div>
      ) : !game ? (
        <div>Game not found.</div>
      ) : (
        <>
          {/* Game Metadata */}
          <div style={{ marginBottom: '20px' }}>
            <h3>Game Metadata</h3>
            <label>
              Name:
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                style={{ marginLeft: '10px', width: '300px' }}
              />
            </label>
            <div style={{ marginTop: '10px' }}>
              <label>
                Thumbnail:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  style={{ marginLeft: '10px' }}
                />
              </label>
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Game thumbnail"
                  style={{ maxWidth: '100px', marginTop: '10px' }}
                />
              )}
            </div>
          </div>

          {/* Questions Management */}
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            {/* Question List */}
            <div style={{ width: '300px', marginRight: '20px' }}>
              <h3>Questions</h3>
              <button
                onClick={addQuestion}
                style={{ marginBottom: '10px', padding: '5px 10px' }}
              >
                Add Question
              </button>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {questions.map((q) => (
                  <li
                    key={q.id}
                    style={{
                      padding: '5px',
                      background:
                        selectedQuestion?.id === q.id ? '#e0e0e0' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <span onClick={() => selectQuestion(q)}>
                      {q.text || 'Untitled Question'}
                    </span>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      style={{ marginLeft: '10px', color: 'red' }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Question Editor */}
            <div style={{ flex: 1 }}>
              {selectedQuestion ? (
                <>
                  <h3>Edit Question</h3>
                  <label>
                    Question Text:
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      style={{ width: '100%', marginBottom: '10px' }}
                    />
                  </label>
                  <h4>Answers</h4>
                  {answers.map((answer, index) => (
                    <div key={index} style={{ marginBottom: '5px' }}>
                      <label>
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
                    </div>
                  ))}
                  <button
                    onClick={() => setAnswers([...answers, ''])}
                    style={{ marginTop: '10px' }}
                  >
                    Add Answer
                  </button>
                  <button
                    onClick={updateQuestion}
                    style={{ marginLeft: '10px' }}
                  >
                    Save Question
                  </button>
                </>
              ) : (
                <p>Select a question to edit or add a new one.</p>
              )}
            </div>
          </div>

          {/* Save and Cancel */}
          <div>
            <button
              onClick={saveGame}
              disabled={isLoading}
              style={{ padding: '10px 20px', marginRight: '10px' }}
            >
              {isLoading ? 'Saving...' : 'Save Game'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
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

export default GameEditor;