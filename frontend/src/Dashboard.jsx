import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showGameSessionId, setShowGameSessionId] = useState(null);
  const [showGameGameId, setShowGameGameId] = useState(null);
  const [showGameSession, setShowGameSession] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // GET request to fetch all games
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
            gameId: game.id ? Number(game.id) : null,
            owner: game.owner ? game.owner : null,
            name: game.name || 'Untitled Game',
            thumbnail: game.thumbnail || '',
            createdAt: game.createdAt || new Date().toISOString(),
            active: game.active || null,
            questions: Array.isArray(game.questions)
              ? game.questions.map((q, index) => ({
                  id: q.id || `${Date.now()}-${index}`,
                  duration: q.duration ? Number(q.duration) : null,
                  correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers.map(String) : [],
                  text: q.text || '',
                  answers: Array.isArray(q.answers) ? q.answers : ['', ''],
                  type: q.type || 'multiple choice',
                }))
              : [],
          }))
        : [];

      if (response.status === 200) {
        setGames(gamesData);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403) {
          setError('Unauthorized: You do not have permission to view games.');
        } else if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response.data?.error || 'An error occurred while fetching games.');
        }
      } else {
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // PUT request to update games
  const updateGames = async (updatedGames) => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    setIsLoading(true);
    setError('');
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
        setShowCreateModal(false);
        setNewGameName('');
        setSelectedFile(null);
        fetchGames();
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403) {
          setError('Forbidden: You do not have permission to update games.');
        } else if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response.data?.error || 'An error occurred while updating games.');
        }
      } else {
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Validate JSON content
  const validateJson = (jsonData) => {
    try {
      // Ensure jsonData is an array of questions
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON must be an array of questions.');
      }
      if (jsonData.length === 0) {
        throw new Error('JSON must contain at least one question.');
      }

      // Validate each question
      jsonData.forEach((q, index) => {
        // Required fields
        if (!q.text || typeof q.text !== 'string') {
          throw new Error(`Question ${index + 1}: Text is required and must be a string.`);
        }
        if (!['multiple choice', 'single choice', 'judgement'].includes(q.type)) {
          throw new Error(`Question ${index + 1}: Type must be multiple choice, single choice, or judgement.`);
        }
        if (!Number.isInteger(q.duration) || q.duration <= 0) {
          throw new Error(`Question ${index + 1}: Duration must be a positive integer.`);
        }
        if (!Number.isInteger(q.points) || q.points <= 0) {
          throw new Error(`Question ${index + 1}: Points must be a positive integer.`);
        }

        // Validate answers
        if (!Array.isArray(q.answers)) {
          throw new Error(`Question ${index + 1}: Answers must be an array.`);
        }
        if (q.type === 'judgement') {
          if (q.answers.length !== 2 || q.answers[0] !== 'True' || q.answers[1] !== 'False') {
            throw new Error(`Question ${index + 1}: Judgement questions must have exactly two answers: True, False.`);
          }
          if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length !== 1 || !['0', '1'].includes(q.correctAnswers[0])) {
            throw new Error(`Question ${index + 1}: Correct answers for judgement must be ["0"] or ["1"].`);
          }
        } else {
          if (q.answers.length < 2 || q.answers.length > 6) {
            throw new Error(`Question ${index + 1}: Answers must be between 2 and 6.`);
          }
          if (!q.answers.every(a => typeof a === 'string' && a.trim())) {
            throw new Error(`Question ${index + 1}: All answers must be non-empty strings.`);
          }
          if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
            throw new Error(`Question ${index + 1}: Correct answers must be a non-empty array.`);
          }
          if (q.correctAnswers.some(i => !Number.isInteger(Number(i)) || Number(i) < 0 || Number(i) >= q.answers.length)) {
            throw new Error(`Question ${index + 1}: Invalid correct answer indices.`);
          }
          if (q.type === 'single choice' && q.correctAnswers.length !== 1) {
            throw new Error(`Question ${index + 1}: Single choice questions must have exactly one correct answer.`);
          }
        }

        // Validate optional fields
        if (q.youtubeUrl && typeof q.youtubeUrl !== 'string') {
          throw new Error(`Question ${index + 1}: youtubeUrl must be a string if provided.`);
        }
        if (q.image && typeof q.image !== 'string') {
          throw new Error(`Question ${index + 1}: Image must be a string if provided.`);
        }
      });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Handle edit game navigation
  const handleEditGame = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  // Handle delete game
  const handleDeleteGame = (gameId) => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const owner = localStorage.getItem('myemail') || 'unknown';
    if (!owner || owner === 'unknown') {
      setError('User not authenticated. Please log in again.');
      return;
    }

    // Filter out the game to delete
    const updatedGames = games
      .filter(game => game.gameId !== Number(gameId))
      .map(game => ({
        id: game.gameId,
        owner: game.owner,
        name: game.name,
        thumbnail: game.thumbnail,
        createdAt: game.createdAt,
        active: game.active,
        questions: game.questions.map(q => ({
          duration: q.duration,
          correctAnswers: q.correctAnswers,
          text: q.text,
          answers: q.answers,
          type: q.type,
        })),
      }));

    updateGames(updatedGames);
  };

  // Handle create game with required name and optional JSON upload
  const handleCreateGame = async () => {
    if (!newGameName.trim()) {
      setError('Game name is required.');
      return;
    }

    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 1000000);
    const newGameId = `${timestamp}${randomPart}`;
    const owner = localStorage.getItem('myemail') || 'unknown';

    if (!owner || owner === 'unknown') {
      setError('User not authenticated. Please log in again.');
      return;
    }

    let newGame = {
      id: Number(newGameId),
      owner: owner,
      name: newGameName,
      questions: [],
      thumbnail: '',
      createdAt: new Date().toISOString(),
      active: null,
    };

    // Handle JSON upload if a file is selected
    if (selectedFile) {
      try {
        const jsonContent = await selectedFile.text();
        const jsonData = JSON.parse(jsonContent);
        if (!validateJson(jsonData)) {
          return;
        }

        // Parse JSON to create questions
        newGame.questions = jsonData.map((q, index) => ({
          id: `${newGameId}-${index + 1}`,
          text: q.text,
          type: q.type,
          duration: q.duration,
          points: q.points,
          youtubeUrl: q.youtubeUrl || '',
          image: q.image || '',
          answers: q.answers,
          correctAnswers: q.correctAnswers.map(String),
        }));
      } catch (err) {
        setError('Failed to parse JSON file: ' + err.message);
        return;
      }
    }

    const updatedGames = [...games.map(game => ({
      id: game.gameId,
      owner: game.owner,
      name: game.name,
      thumbnail: game.thumbnail,
      createdAt: game.createdAt,
      active: game.active,
      questions: game.questions.map(q => ({
        duration: q.duration,
        correctAnswers: q.correctAnswers,
        text: q.text,
        answers: q.answers,
        type: q.type,
      })),
    })), newGame];

    updateGames(updatedGames);
  };

  // Start game
  const startGame = async (id) => {
    setError('');
    setIsStarting(true);
    try {
      const response = await axios.post(
        `http://localhost:5005/admin/game/${id}/mutate`,
        { "mutationType": "START" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        fetchGames();
        setShowGameSessionId(response.data.data.sessionId);
        setShowGameGameId(id);
        setShowGameSession(true);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError("Game already has active session, now stop it.");
          stopGame(id);
        } else if (err.response.status === 403) {
          setError(err.response.data.error);
        } else {
          setError(err.response.data?.error || 'An error occurred while updating games.');
        }
      } else {
        console.log(err);
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  // Stop game
  const stopGame = async (id) => {
    try {
      const response = await axios.post(
        `http://localhost:5005/admin/game/${id}/mutate`,
        { "mutationType": "END" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        console.log(response.data);
        setShowGameSessionId('');
        fetchGames();
        navigate(`/session/${games.find(g => g.gameId === id).active}`, { state: { gameId: id } });
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data.error);
        } else if (err.response.status === 403) {
          setError(err.response.data.error);
        } else {
          setError(err.response.data?.error || 'An error occurred while updating games.');
        }
      } else {
        console.log(err);
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show game
  const showGame = async (targetId) => {
    navigate(`/session/${games.find(g => g.gameId === targetId).active}`, { state: { gameId: targetId } });
  };

  // Call fetchGames when the component mounts
  useEffect(() => {
    fetchGames();
  }, []);

  // Define all styles as named objects
  

  return (
    <div style={containerStyle}>
      <div style={dashboardStyle}>
        <h2 style={titleStyle}>Admin Dashboard</h2>

        <div style={buttonContainerStyle}>
          <button
            style={isLoading ? disabledButtonStyle : buttonStyle}
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            Create Game
          </button>
        </div>

        {isLoading && <div style={loadingStyle}>Loading...</div>}
        {error && <div style={errorStyle}>{error}</div>}

        {games.length > 0 ? (
          <div>
            <h3 style={subtitleStyle}>Games List</h3>
            <ul style={gameListStyle}>
              {games.map((game) => (
                <li key={game.gameId ?? 'missing-id'} style={gameItemStyle}>
                  <div style={gameDetailStyle}><strong>Game ID:</strong> {game.gameId ?? 'N/A'}</div>
                  <div style={gameDetailStyle}><strong>Owner:</strong> {game.owner ?? 'N/A'}</div>
                  <div style={gameDetailStyle}><strong>Name:</strong> {game.name}</div>
                  <div style={gameDetailStyle}><strong>Created At:</strong> {new Date(game.createdAt).toLocaleString()}</div>
                  <div style={gameDetailStyle}><strong>Active:</strong> {game.active ? 'Yes' : 'No'}</div>
                  {game.thumbnail && (
                    <div style={gameDetailStyle}>
                      <strong>Thumbnail:</strong>{' '}
                      <img
                        src={game.thumbnail}
                        alt={`${game.name} thumbnail`}
                        style={thumbnailStyle}
                      />
                    </div>
                  )}
                  <div style={gameDetailStyle}>
                    <strong>Questions:</strong>
                    {game.questions.length > 0 ? (
                      <ul style={questionListStyle}>
                        {game.questions.map((q) => (
                          <li key={q.id} style={questionItemStyle}>
                            <div style={gameDetailStyle}><strong>Text:</strong> {q.text || 'Untitled Question'}</div>
                            <div style={gameDetailStyle}><strong>Duration:</strong> {q.duration ?? 'N/A'} seconds</div>
                            <div style={gameDetailStyle}><strong>Correct Answers:</strong> {q.correctAnswers.length > 0 ? q.correctAnswers.join(', ') : 'None'}</div>
                            <div style={gameDetailStyle}><strong>Type:</strong> {q.type}</div>
                            <div style={gameDetailStyle}><strong>Answers:</strong> {q.answers.length > 0 ? q.answers.join(', ') : 'None'}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={noQuestionsStyle}>No questions available.</p>
                    )}
                  </div>
                  <div style={gameActionsStyle}>
                    <button
                      style={buttonStyle}
                      onClick={() => handleEditGame(game.gameId)}
                    >
                      Edit Game
                    </button>
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDeleteGame(game.gameId)}
                    >
                      Delete Game
                    </button>
                    <button
                      style={game.active ? disabledButtonStyle : buttonStyle}
                      onClick={() => startGame(game.gameId)}
                      disabled={game.active}
                    >
                      Start Game
                    </button>
                    {game.active && (
                      <button
                        style={buttonStyle}
                        onClick={() => showGame(game.gameId)}
                      >
                        Show Game
                      </button>
                    )}
                    {game.active && (
                      <button
                        style={buttonStyle}
                        onClick={() => stopGame(game.gameId)}
                      >
                        Stop Game
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={noGamesStyle}>No games available.</p>
        )}

        {showCreateModal && (
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>Create New Game</h3>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Game Name (required):</label>
              <input
                type="text"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder="Enter game name"
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Upload JSON (optional):</label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={fileInputStyle}
              />
            </div>
            <div style={modalButtonContainerStyle}>
              <button
                style={isLoading ? disabledButtonStyle : buttonStyle}
                onClick={handleCreateGame}
                disabled={isLoading}
              >
                Create
              </button>
              <button
                style={buttonStyle}
                onClick={() => {
                  setShowCreateModal(false);
                  setNewGameName('');
                  setSelectedFile(null);
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showGameSession && (
          <Modal onClose={() => setShowGameSession(false)}>
            <div style={sessionModalContentStyle}>
              <p style={sessionModalTextStyle}>Session ID: {showGameSessionId}</p>
              <button
                style={buttonStyle}
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/play/${showGameSessionId}`);
                }}
              >
                Copy Link
              </button>
              <button
                style={buttonStyle}
                onClick={() => showGame(showGameGameId)}
              >
                Show Game
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Dashboard;