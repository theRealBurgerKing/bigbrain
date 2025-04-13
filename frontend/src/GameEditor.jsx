import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GameForm from './GameForm';

function GameEditor() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [game, setGame] = useState(null);

  // Fetch game data on mount
  useEffect(() => {
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
        console.log('Raw response:', response.data); // Debug raw data

        // Convert games object to array
        const games = Object.keys(response.data.games).map((id) => ({
          id,
          ...response.data.games[id],
        }));
        console.log('Normalized games:', games); // Debug normalized data

        if (response.status === 200) {
          const gameData = games.find((g) => g.id.toString() === gameId);
          if (gameData) {
            console.log('Found game:', gameData); // Debug selected game
            setGame(gameData);
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

  // Handle save game
  const handleSaveGame = async (gameData) => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Saving game:', gameData); // Debug
      const response = await axios.put(
        'http://localhost:5005/admin/games',
        {
          games: [gameData],
        },
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

  if (isLoading && !game) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!game) return <div>Game not found.</div>;

  return (
    <GameForm
      initialGame={game}
      onSave={handleSaveGame}
      onCancel={() => navigate('/dashboard')}
    />
  );
}

export default GameEditor;