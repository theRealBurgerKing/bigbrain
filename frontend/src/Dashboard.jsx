import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GameForm from './GameForm';
import Modal from './Modal';


function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showCreateGame, setShowCreateGame] = useState(false);

  const [showGameSessionId, setShowGameSessionId] = useState(null);
  const [showGameSession, setShowGameSession] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [activeSession, setActiveSession] = useState({});

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
      console.log('Dashboard fetched games:', response.data);
      const games = Array.isArray(response.data.games)
        ? response.data.games.map((game) => ({
            ...game,
            questions: Array.isArray(game.questions)
              ? game.questions.map((q) => ({
                  id: q.id || Date.now(),
                  text: q.text || '',
                  answers: Array.isArray(q.answers) ? q.answers : ['', ''],
                  type: q.type || 'multiple choice',
                  timeLimit: q.timeLimit || 30,
                  points: q.points || 10,
                  youtubeUrl: q.youtubeUrl || '',
                  image: q.image || '',
                  correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [],
                  isCorrect: q.isCorrect || false,
                }))
              : [],
          }))
        : [];
      if (response.status === 200) {
        setGames(games);
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

  const fetchSession=  async () => {

  };

  // Call fetchGames when the component mounts
  useEffect(() => {
    fetchGames();
  }, []);

  // PUT request to change games
  const putGames = async (updatedGames) => {
    setIsLoading(true);
    try {
      console.log('Sending updated games:', updatedGames);
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
        alert('Games updated successfully!');
        fetchGames();
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError('Bad input: Please check the game data format.');
        } else if (err.response.status === 403) {
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
      setShowCreateGame(false);
      setIsLoading(false);
    }
  };

  // Handle game creation
  const handleCreateGame = (gameData) => {
    const email = localStorage.getItem('email');
    const timestamp = Date.now();
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
    }
    const randomPart = Math.floor(Math.random() * 1000);
    const uniqueId = `${timestamp.toString().slice(2, 10)}${hash.toString().slice(-6)}${randomPart}`;
    const newGame = {
      id: uniqueId,
      name: gameData.name,
      owner: email,
      thumbnail: gameData.thumbnail,
      questions: gameData.questions,
      createdAt: new Date().toISOString(),
      active: 0,
    };
    const updatedGames = [...games, newGame];
    putGames(updatedGames);
  };

  // Delete game
  const deleteGame = async (id) => {
    const updatedGames = games.filter((game) => game.id !== id);
    putGames(updatedGames);
  };

  //

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
        setActiveSession(prev => ({
          ...prev,
          [id]: response.data.data.sessionId
        }));
        setActiveGame(id);
        setShowGameSessionId(response.data.data.sessionId);
        setShowGameSession(true);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError("Game already has active session,now stop it.");
          stopGame(id)
        } else if (err.response.status === 403) {
          setError(err.response.data.error);
        }else {
          setError(err.response.data?.error || 'An error occurred while updating games.');
        }
      } else {
        console.log(err)
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
        console.log(response.data)
        setActiveSession(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data.error);
        } else if (err.response.status === 403) {
          setError(err.response.data.error);
        }else {
          setError(err.response.data?.error || 'An error occurred while updating games.');
        }
      } else {
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
    
  };

  // Show game
  const showGame = async (id) => {
    setShowGameSessionId(activeSession[id])
    setShowGameSession(true)
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowCreateGame(true)}
          disabled={isLoading}
          style={{ padding: '10px 20px' }}
        >
          {isLoading ? 'Creating...' : 'Create Game'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {games.length > 0 ? (
        <div>
          <h3>Games List</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {games.map((game) => (
              <li
                key={game.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              >
                <strong>Name:</strong> {game.name} <br />
                <strong>ID:</strong> {game.id} <br />
                <strong>Owner:</strong> {game.owner} <br />
                <strong>Created At:</strong>{' '}
                {new Date(game.createdAt).toLocaleString()} <br />
                <strong>Active:</strong> {game.active ? 'Yes' : 'No'} <br />
                <button onClick={() => navigate(`/game/${game.id}`)}>
                  Edit Game
                </button>
                <button onClick={() => deleteGame(game.id)}>Delete Game</button>
                <button
                  onClick={() => startGame(game.id)}
                  // disabled={activeSession.includes(game.id)}
                >
                  Start Game
                </button>
                {activeSession[game.id] &&(
                  <button onClick={() => showGame(game.id)}>show Game</button>
                )}
                {activeSession[game.id] && (
                  <button onClick={() => stopGame(game.id)}>Stop Game</button>
                )}
                
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
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No games available.</p>
      )}

      {showCreateGame && (
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
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <GameForm
            initialGame={null}
            onSave={handleCreateGame}
            onCancel={() => setShowCreateGame(false)}
          />
        </div>
      )}

      {showGameSession && (
        <Modal onClose={() => setShowGameSession(false)}>
          <p>Session ID: {showGameSessionId}</p>
          <button onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/play/${showGameSessionId}`);
            }}>
            Copy Link
          </button>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;