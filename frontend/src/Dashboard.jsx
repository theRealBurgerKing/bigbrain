import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // GET request to fetch all games
  const fetchGames = async () => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5005/admin/games', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setGames(response.data.games || []);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403) {
          setError('Unauthorized: You do not have permission to view games.');
        } else if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
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

  // Call fetchGames when the component mounts
  useEffect(() => {
    fetchGames();
  }, []);

  // PUT request to update games
  const updateGames = async () => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.put(
        'http://localhost:5005/admin/games',
        {
          games: [
            {
              id: 56513315,
              name: 'My first game',
              owner: '111',
              questions: [{}],
            },
          ],
        },
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
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setError(err.response.data?.error || 'An error occurred while updating games.');
        }
      } else {
        call
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={updateGames}
          disabled={isLoading}
          style={{ padding: '10px 20px' }}
        >
          {isLoading ? 'Creating...' : 'Create Games'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
      )}

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
        <p>No games available. Click "Fetch Games" to load the list.</p>
      )}
    </div>
  );
}

export default Dashboard;