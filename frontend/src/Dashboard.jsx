import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGameName, setNewGameName] = useState('');

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
  // Handle create game
  const handleCreateGame = () => {
    if (!newGameName.trim()) {
      setError('Game name is required.');
      return;
    }
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 1000000);
    const newGameId = `${timestamp}${randomPart}`;
    const owner = localStorage.getItem('myemail');

    const newGame = {
      id: Number(newGameId),
      owner: owner,
      name: newGameName,
      questions: [],
      thumbnail: '',
      createdAt: new Date().toISOString(),
      active: null,
    };
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

  // Call fetchGames when the component mounts
  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isLoading}
          style={{ padding: '10px 20px' }}
        >
          Create Game
        </button>
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {games.length > 0 ? (
        <div>
          <h3>Games List</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {games.map((game) => (
              <li
                key={game.gameId ?? 'missing-id'}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              >
                <strong>Game ID:</strong> {game.gameId ?? 'N/A'} <br />
                <strong>Owner:</strong> {game.owner ?? 'N/A'} <br />
                <strong>Name:</strong> {game.name} <br />
                <strong>Created At:</strong>{' '}
                {new Date(game.createdAt).toLocaleString()} <br />
                <strong>Active:</strong> {game.active ? 'Yes' : 'No'} <br />
                {game.thumbnail && (
                  <>
                    <strong>Thumbnail:</strong>{' '}
                    <img
                      src={game.thumbnail}
                      alt={`${game.name} thumbnail`}
                      style={{ maxWidth: '100px', marginTop: '5px' }}
                    />
                  </>
                )}
                <strong>Questions:</strong>
                {game.questions.length > 0 ? (
                  <ul style={{ paddingLeft: '20px' }}>
                    {game.questions.map((q) => (
                      <li key={q.id}>
                        <strong>Text:</strong> {q.text || 'Untitled Question'} <br />
                        <strong>Duration:</strong> {q.duration ?? 'N/A'} seconds <br />
                        <strong>Correct Answers:</strong>{' '}
                        {q.correctAnswers.length > 0 ? q.correctAnswers.join(', ') : 'None'} <br />
                        <strong>Type:</strong> {q.type} <br />
                        <strong>Answers:</strong>{' '}
                        {q.answers.length > 0 ? q.answers.join(', ') : 'None'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No questions available.</p>
                )}
                <button
                  onClick={() => handleEditGame(game.gameId)}
                  style={{ padding: '5px 10px', marginTop: '10px', marginRight: '10px' }}
                >
                  Edit Game
                </button>
                <button
                  onClick={() => handleDeleteGame(game.gameId)}
                  style={{ padding: '5px 10px', marginTop: '10px', color: 'red' }}
                >
                  Delete Game
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No games available.</p>
      )}

      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            border: '1px solid #ccc',
            zIndex: '1000',
            width: '300px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <h3>Create New Game</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Game Name:
              <input
                type="text"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                placeholder="Enter game name"
                style={{ marginLeft: '10px', width: '200px' }}
              />
            </label>
          </div>
          <div>
            <button
              onClick={handleCreateGame}
              disabled={isLoading}
              style={{ padding: '5px 10px', marginRight: '10px' }}
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewGameName('');
                setError('');
              }}
              style={{ padding: '5px 10px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;