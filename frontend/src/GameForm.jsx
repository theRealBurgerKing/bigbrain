import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Reusable game form for creating or editing a game
function GameForm({ initialGame, onSave, onCancel }) {
  const [gameName, setGameName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize form with initialGame data (if provided)
  useEffect(() => {
    console.log('GameForm received initialGame:', initialGame);
    if (initialGame) {
      setGameName(initialGame.name || '');
      setThumbnail(initialGame.thumbnail || '');
      const initialQuestions = Array.isArray(initialGame.questions)
        ? initialGame.questions.map((q, index) => ({
            id: q.id || Date.now() + index,
            text: q.text || '',
            answers: Array.isArray(q.answers) ? q.answers : ['', ''],
            type: q.type || 'multiple choice', // Default type
            timeLimit: q.timeLimit || 30, // Default time limit (seconds)
            points: q.points || 10, // Default points
            youtubeUrl: q.youtubeUrl || '',
            image: q.image || '',
            correctAnswers: q.correctAnswers || [], // For single/multiple choice
            isCorrect: q.isCorrect || false, // For judgement
          }))
        : [];
      setQuestions(initialQuestions);
      console.log('Initialized questions:', initialQuestions);
    } else {
      setGameName('');
      setThumbnail('');
      setQuestions([]);
    }
  }, [initialGame]);

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

  // Navigate to question editor
  const editQuestion = (question) => {
    navigate(`/game/${initialGame.id}/question/${question.id}`);
  };

  // Add a new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      answers: ['', ''],
      type: 'multiple choice',
      timeLimit: 30,
      points: 10,
      youtubeUrl: '',
      image: '',
      correctAnswers: [],
      isCorrect: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Delete a question
  const deleteQuestion = (questionId) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);
  };

  // Handle save
  const handleSave = () => {
    if (!gameName) {
      setError('Game name is required.');
      return;
    }
    const gameData = {
      ...initialGame,
      name: gameName,
      thumbnail: thumbnail || undefined,
      questions: questions.length > 0 ? questions : [],
    };
    console.log('Saving game data:', gameData);
    onSave(gameData);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>{initialGame ? 'Edit Game' : 'Create New Game'}</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Game Metadata */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Game Metadata</h3>
        <label>
          Name:
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Enter game name"
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
      <div style={{ marginBottom: '20px' }}>
        <h3>Questions</h3>
        <button
          onClick={addQuestion}
          style={{ marginBottom: '10px', padding: '5px 10px' }}
        >
          Add Question
        </button>
        {questions.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {questions.map((q) => (
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
                <span onClick={() => editQuestion(q)}>
                  {q.text || 'Untitled Question'}
                </span>
                <button
                  onClick={() => deleteQuestion(q.id)}
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

      {/* Save and Cancel */}
      <div>
        <button
          onClick={handleSave}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          style={{ padding: '10px 20px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default GameForm;