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

  // Define all styles as named objects
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: '0px',
    margin: '0px',
    backgroundColor: '#f0f2f5',
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
    // textAlign: 'center',
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

  const inputGroupStyle = {
    marginBottom: '1.5vh',
    textAlign: 'left',
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

  const fileInputStyle = {
    fontSize: '1.8vh',
    color: '#555',
    marginLeft: '1vw',
  };

  const thumbnailStyle = {
    maxWidth: '10vw',
    marginTop: '0.5vh',
  };

  if (isLoading) return <div style={loadingStyle}>Loading...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;
  if (!game) return <div style={gameNotFoundStyle}>Game not found.</div>;

  return (
    <div style={containerStyle}>
      <div style={editorStyle}>
        <h2 style={titleStyle}>Edit Game: {game.name}</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={buttonContainerStyle}>
          <button
            style={buttonStyle}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
        {/* Edit Game Metadata */}
        <div style={inputGroupStyle}>
          <h3 style={subtitleStyle}>Game Metadata</h3>
          <label style={labelStyle}>
            Game Name:
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name"
              style={inputStyle}
            />
          </label>
          <div style={{ marginTop: '1vh' }}>
            <label style={labelStyle}>
              Thumbnail:
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                style={fileInputStyle}
              />
            </label>
            {thumbnail && (
              <img
                src={thumbnail}
                alt="Game thumbnail"
                style={thumbnailStyle}
              />
            )}
          </div>
          <div style={buttonContainerStyle}>
            <button
              style={buttonStyle}
              onClick={() => navigate(`/game/${gameId}/questions`)}
            >
              Edit Questions
            </button>
          </div>
          <div style={buttonContainerStyle}>
            <button
              style={isLoading ? disabledButtonStyle : buttonStyle}
              onClick={handleSaveGame}
              disabled={isLoading}
            >
              Save
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default GameEditor;