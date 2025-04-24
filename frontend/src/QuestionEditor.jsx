import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';

function QuestionEditor() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [showModal, setShowModal] = useState(false);
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
      answers: type === 'judgement' ? ['True', 'False'] : ['', ''], // Set fixed answers for judgement type
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
    const updatedGames = games.map((g) =>
      g.gameId === gameId
        ? {
          ...g,
          questions: g.questions.filter((q) => q.id !== questionId),
        }
        : g
    );
    setGames(updatedGames);
    updateGames(updatedGames);
    fetchGames();
  };

  // Handle edit question navigation
  const handleEditQuestion = (questionId) => {
    navigate(`/game/${gameId}/question/${questionId}`);
  };

  // Handle answer change
  const handleAnswerChange = (index, value) => {
    if (type !== 'judgement') { // Prevent modifying answers for judgement type
      const newAnswers = [...answers];
      newAnswers[index] = value;
      setAnswers(newAnswers);
    }
  };

  // Add new answer option
  const addAnswer = () => {
    if (type !== 'judgement' && answers.length < 6) { // Prevent adding answers for judgement type
      setAnswers([...answers, '']);
    } else if (answers.length >= 6) {
      setModalError('Maximum 6 answers allowed.');
      setShowModal(true);
    }
  };

  // Remove answer option
  const removeAnswer = (index) => {
    if (type !== 'judgement' && answers.length > 2) { // Prevent removing answers for judgement type
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
      setCorrectAnswers(correctAnswers.filter((answerIndex) => answerIndex !== index.toString()));
    } else if (type !== 'judgement') {
      setModalError('Minimum 2 answers required.');
      setShowModal(true);
    }
  };

  // Handle correct answer toggle (for multiple choice and single choice)
  const toggleCorrectAnswer = (index) => {
    if (type === 'single choice' || type === 'judgement') {
      setCorrectAnswers([index.toString()]); // Allow only one correct answer for single choice and judgement
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
      setModalError('No token found. Please log in again.');
      setShowModal(true);
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
          setModalError('Session expired. Please log in again.');
          setShowModal(true);
          localStorage.removeItem('token');
          localStorage.removeItem('myusername');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setModalError('Forbidden: You do not have permission to update this game.');
          setShowModal(true);
        } else {
          setModalError(err.response.data?.error || 'An error occurred while updating the question.');
          setShowModal(true);
        }
      } else {
        setModalError('Failed to connect to the server.');
        setShowModal(true);
      }
    }
  };

  // Handle save question
  const handleSave = async () => {
    if (!token) {
      setModalError('No token found. Please log in again.');
      setShowModal(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
  
    if (!text.trim()) {
      setModalError('Question text is required.');
      setShowModal(true);
      return;
    }
  
    if (duration < 1) {
      setModalError('Time limit must be at least 1 second.');
      setShowModal(true);
      return;
    }
  
    if (points < 1) {
      setModalError('Points must be at least 1.');
      setShowModal(true);
      return;
    }
  
    if (type !== 'judgement' && (answers.length < 2 || answers.length > 6)) {
      setModalError('Answers must be between 2 and 6.');
      setShowModal(true);
      return;
    }
  
    if (type === 'single choice' && correctAnswers.length !== 1) {
      setModalError('Single choice questions must have exactly one correct answer.');
      setShowModal(true);
      return;
    }
  
    if (type === 'multiple choice' && correctAnswers.length < 1) {
      setModalError('Multiple choice questions must have at least one correct answer.');
      setShowModal(true);
      return;
    }
  
    if (type === 'judgement' && correctAnswers.length !== 1) {
      setModalError('Judgement questions must have exactly one correct answer (True or False).');
      setShowModal(true);
      return;
    }
  
    setIsLoading(true);
    setModalError('');
  
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
                  answers: type === 'judgement' ? ['True', 'False'] : answers, // Ensure fixed answers for judgement
                  correctAnswers: type !== 'judgement' ? correctAnswers : correctAnswers,
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
          setModalError('Session expired. Please log in again.');
          setShowModal(true);
          localStorage.removeItem('token');
          localStorage.removeItem('myusername');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setModalError('Forbidden: You do not have permission to update this game.');
          setShowModal(true);
        } else {
          setModalError(err.response.data?.error || 'An error occurred while updating the question.');
          setShowModal(true);
        }
      } else {
        setModalError('Failed to connect to the server.');
        setShowModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Define styles as named objects
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '0px',
    margin: '0px',
    // Removed backgroundColor since Pages.jsx now handles it
  };

  const editorStyle = {
    width: '50vw',
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

  const buttonContainerStyle = {
    marginBottom: '2vh',
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

  const deleteButtonStyle = {
    padding: '1vh 2vw',
    fontSize: '1.8vh',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0.5vh 1vw',
    transition: 'background-color 0.3s, transform 0.1s',
  };

  const disabledDeleteButtonStyle = {
    padding: '1vh 2vw',
    fontSize: '1.8vh',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#f87171',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    margin: '0.5vh 1vw',
  };

  const loadingStyle = {
    textAlign: 'center',
    fontSize: '1.8vh',
    color: '#555',
  };

  const errorStyle = {
    color: 'red',
    fontSize: '1.8vh',
    marginBottom: '1vh',
    textAlign: 'center',
  };

  const gameNotFoundStyle = {
    fontSize: '1.8vh',
    color: '#555',
    textAlign: 'center',
  };

  const questionNotFoundStyle = {
    fontSize: '1.8vh',
    color: '#555',
    textAlign: 'center',
  };

  const questionListStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  };

  const questionItemStyle = {
    padding: '1vh 1vw',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5vh',
    borderBottom: '1px solid #eee',
  };

  const questionTextStyle = {
    fontSize: '1.8vh',
    color: '#333',
  };

  const noQuestionsStyle = {
    fontSize: '1.8vh',
    color: '#555',
  };

  const inputGroupStyle = {
    marginBottom: '1.5vh',
    textAlign: 'left',
  };

  const answerGroupStyle = {
    marginBottom: '0.5vh',
    display: 'flex',
    alignItems: 'center',
  };

  const labelStyle = {
    fontSize: '1.5vh',
    color: '#555',
    marginBottom: '0.5vh',
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

  const selectStyle = {
    width: '25vw',
    padding: '1vh 1vw',
    fontSize: '1.8vh',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    marginLeft: '1vw',
  };

  const numberInputStyle = {
    width: '10vw',
    padding: '1vh 1vw',
    fontSize: '1.8vh',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    marginLeft: '1vw',
  };

  const answerInputStyle = {
    width: '20vw',
    padding: '1vh 1vw',
    fontSize: '1.8vh',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    marginLeft: '1vw',
    marginRight: '1vw',
  };

  const fileInputStyle = {
    fontSize: '1.8vh',
    color: '#555',
    marginLeft: '1vw',
  };

  const thumbnailStyle = {
    maxWidth: '10vw',
    marginTop: '0.5vh',
  };

  const modalTextStyle = {
    fontSize: '1.8vh',
    color: '#333',
    textAlign: 'center',
  };

  if (isLoading) return <div style={loadingStyle}>Loading...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  // If no questionId is provided, show the question list
  if (!questionId) {
    if (!game) return <div style={gameNotFoundStyle}>Game not found.</div>;

    return (
      <div style={containerStyle}>
        
        <div style={editorStyle}>
          <h2 style={titleStyle}>Questions for Game: {game.name}</h2>
          {error && <div style={errorStyle}>{error}</div>}
          <div >
            <button
              style={buttonStyle}
              onClick={() => navigate(`/game/${gameId}`)}
            >
              Back to Game Editor
            </button>
          </div>

          <div style={inputGroupStyle}>
            
            {game.questions.length > 0 ? (
              <ul style={questionListStyle}>
                {game.questions.map((q) => (
                  <li
                    key={q.id}
                    style={questionItemStyle}
                  >
                    <span
                      style={questionTextStyle}
                      onClick={() => handleEditQuestion(q.id)}
                    >
                      {q.text || 'Untitled Question'}
                    </span>
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={noQuestionsStyle}>No questions yet. Click &quot;Add Question&quot; to start.</p>
            )}
            <button
              style={buttonStyle}
              onClick={handleAddQuestion}
            >
              Add Question
            </button>
          </div>

          
        </div>
      </div>
    );
  }

  // If questionId is provided, show the question editor
  if (!question) return <div style={questionNotFoundStyle}>Question not found.</div>;

  return (
    <div style={containerStyle}>
      <div style={editorStyle}>
        <h2 style={titleStyle}>Edit Question</h2>
        {error && <div style={errorStyle}>{error}</div>}
  
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Question Type:
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCorrectAnswers([]);
                if (e.target.value === 'judgement') {
                  setAnswers(['True', 'False']); // Set fixed answers for judgement
                } else if (e.target.value === 'multiple choice') {
                  setAnswers(['', '']); // Clear answers when switching to multiple choice
                }
                else if (e.target.value === 'single') {
                  setAnswers(['', '']); // Clear answers when switching to multiple choice
                }
              }}
              style={selectStyle}
            >
              <option value="multiple choice">Multiple Choice</option>
              <option value="single choice">Single Choice</option>
              <option value="judgement">Judgement</option>
            </select>
          </label>
        </div>
  
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Question:
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter question"
              style={inputStyle}
            />
          </label>
        </div>
  
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Time Limit (seconds):
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              style={numberInputStyle}
            />
          </label>
        </div>
  
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Points:
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              style={numberInputStyle}
            />
          </label>
        </div>
  
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            YouTube URL (optional):
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              style={inputStyle}
            />
          </label>
        </div>
  
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Image (optional):
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={fileInputStyle}
            />
          </label>
          {image && (
            <img
              src={image}
              alt="Question image"
              style={thumbnailStyle}
            />
          )}
        </div>
  
        <div style={inputGroupStyle}>
          <h3 style={subtitleStyle}>Answers</h3>
          {answers.map((answer, index) => (
            <div key={index} style={answerGroupStyle}>
              <label style={labelStyle}>
                Answer {index + 1}:
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  style={answerInputStyle}
                  disabled={type === 'judgement'} // Disable editing for judgement answers
                />
              </label>
              <label style={{ marginLeft: '1vw' }}>
                <input
                  type={type === 'multiple choice' ? 'checkbox' : 'radio'} // Use radio for single choice and judgement
                  checked={correctAnswers.includes(index.toString())}
                  onChange={() => toggleCorrectAnswer(index)}
                />
                Correct
              </label>
              {type !== 'judgement' && (
                <button
                  style={answers.length <= 2 ? disabledDeleteButtonStyle : deleteButtonStyle}
                  onClick={() => removeAnswer(index)}
                  disabled={answers.length <= 2}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {type !== 'judgement' && (
            <button
              style={answers.length >= 6 ? disabledButtonStyle : buttonStyle}
              onClick={addAnswer}
              disabled={answers.length >= 6}
            >
              Add Answer
            </button>
          )}
        </div>
  
        <div style={buttonContainerStyle}>
          <button
            style={isLoading ? disabledButtonStyle : buttonStyle}
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            style={buttonStyle}
            onClick={() => navigate(`/game/${gameId}/questions`)}
          >
            Cancel
          </button>
        </div>

        {/* Modal for displaying errors */}
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <p style={modalTextStyle}>{modalError}</p>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default QuestionEditor;