import { useState, useEffect } from 'react';

// Reusable game form for creating or editing a game
function GameForm({ initialGame, onSave, onCancel }) {
  const [gameName, setGameName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '']);
  const [error, setError] = useState('');

  // Initialize form with initialGame data (if provided)
  useEffect(() => {
    if (initialGame) {
      setGameName(initialGame.name || '');
      setThumbnail(initialGame.thumbnail || '');
      setQuestions(
        initialGame.questions?.length > 0
          ? initialGame.questions
          : [{ id: Date.now(), text: '', answers: ['', ''] }]
      );
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

  // Select a question to edit
  const selectQuestion = (question) => {
    setSelectedQuestion(question);
    setQuestionText(question.text || '');
    setAnswers(question.answers || ['', '']);
  };

  // Add a new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(), // Temporary ID
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

  // Handle save
  const handleSave = () => {
    if (!gameName) {
      setError('Game name is required.');
      return;
    }
    const gameData = {
      ...initialGame, // Preserve fields like id, owner for edit mode
      name: gameName,
      thumbnail: thumbnail || undefined,
      questions: questions.length > 0 ? questions : [{}],
    };
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