import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function GameEditor() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const [game, setGame] = useState(null);
  const [gameName, setGameName] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  // Fetch all games on mount
  useEffect(() => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const fetchGames = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:5005/admin/games', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const gamesData = response.data.games
          ? Object.values(response.data.games).map((game) => ({
              gameId: game.id ? Number(game.id) : null,
              owner: game.owner || null,
              name: game.name || 'Untitled Game',
              thumbnail: game.thumbnail || '',
              createdAt: game.createdAt || new Date().toISOString(),
              active: game.active || null,
              questions: Array.isArray(game.questions)
                ? game.questions.map((q, index) => ({
                    id: q.id || `${Date.now()}-${index}`,
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
          const gameData = gamesData.find((g) => g.gameId === Number(gameId));
          if (gameData) {
            setGame(gameData);
            setGameName(gameData.name);
            setThumbnail(gameData.thumbnail);
          } else {
            setError('Game not found.');
          }
        }
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            setError('Session expired. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('myemail');
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

    fetchGames();
  }, [gameId, token, navigate]);

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

  // Handle save game metadata
  const handleSaveGame = async () => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!gameName.trim()) {
      setError('Game name is required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedGames = games.map((g) =>
        g.gameId === Number(gameId)
          ? {
              id: g.gameId,
              owner: g.owner,
              name: gameName,
              thumbnail: thumbnail || '',
              createdAt: g.createdAt,
              active: g.active,
              questions: g.questions,
            }
          : g
      );

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
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('myemail');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setError('Forbidden: You do not have permission to update this game.');
        } else {
          setError(err.response.data?.error || 'An error occurred while updating the game.');
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
  if (!game) return <div>Game not found.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Game: {game.name}</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <button
        onClick={() => navigate('/dashboard')}
        style={{ padding: '10px 20px' }}
      >
        Back to Dashboard
      </button>
      {/* Edit Game Metadata */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Game Metadata</h3>
        <label>
          Game Name:
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
        <button
          onClick={handleSaveGame}
          disabled={isLoading}
          style={{ padding: '5px 10px', marginTop: '10px', marginRight: '10px' }}
        >
          Save Metadata
        </button>
        <button
          onClick={() => navigate(`/game/${gameId}/questions`)}
          style={{ padding: '5px 10px', marginTop: '10px' }}
        >
          Edit Questions
        </button>
      </div>

      
    </div>
  );
}

export default GameEditor;