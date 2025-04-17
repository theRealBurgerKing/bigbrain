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
          const gameData = gamesData.find((g) => g.gameId === Number(gameId));
          if (gameData) {
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

  // Handle save game
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
      // Update the specific game in the games list
      const updatedGames = games.map((game) =>
        game.gameId === Number(gameId)
          ? {
              id: game.gameId,
              owner: game.owner,
              name: gameName,
              thumbnail: thumbnail || '',
              createdAt: game.createdAt,
              active: game.active,
              questions: game.questions.map(q => ({
                duration: q.duration,
                correctAnswers: q.correctAnswers,
                text: q.text,
                answers: q.answers,
                type: q.type,
              })),
            }
          : {
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
            }
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

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Game Metadata</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div style={{ marginBottom: '20px' }}>
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
      </div>

      <div style={{ marginBottom: '20px' }}>
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

      <div>
        <button
          onClick={handleSaveGame}
          disabled={isLoading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '10px 20px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default GameEditor;