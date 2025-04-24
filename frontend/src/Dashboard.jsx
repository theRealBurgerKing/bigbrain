import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import useMediaQuery from '@mui/material/useMediaQuery';
import styled from 'styled-components';

const Container = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  padding: '0px',
  margin: '0px',
  backgroundColor: '#f0f2f5',
}));

const DashboardContainer = styled.div(({ isMobile }) => ({
  width: isMobile ? '90vw' : '50vw',
  padding: isMobile ? '2vh 4vw' : '2vh 3vw',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  margin: '2vh 0',
}));

const Title = styled.h2(({ isMobile }) => ({
  fontSize: isMobile ? '2rem' : '3vh',
  fontWeight: '600',
  color: '#333',
  marginBottom: '2vh',
}));

const Subtitle = styled.h3(({ isMobile }) => ({
  fontSize: isMobile ? '1.5rem' : '2.5vh',
  fontWeight: '500',
  color: '#333',
  marginBottom: '2vh',
  textAlign: 'left',
}));

const ButtonContainer = styled.div(() => ({
  marginBottom: '2vh',
  textAlign: 'center',
}));

const Button = styled.button(({ isMobile, disabled }) => ({
  height: isMobile ? '5vh' : '3vh',
  width: isMobile ? '30vw' : '9vw',
  fontSize: isMobile ? '1rem' : '1.3vh',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: disabled ? '#a3bffa' : '#3b82f6',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  margin: isMobile ? '0.5vh 2vw' : '0.5vh 1vw',
  transition: 'background-color 0.3s, transform 0.1s',
}));

const LoadingText = styled.div(({ isMobile }) => ({
  textAlign: 'center',
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
}));

const ErrorText = styled.div(({ isMobile }) => ({
  color: 'red',
  fontSize: isMobile ? '1rem' : '1.8vh',
  marginBottom: '1vh',
  textAlign: 'center',
}));

const GameList = styled.ul(() => ({
  listStyle: 'none',
  padding: '0',
  margin: '0',
}));

const GameItem = styled.li(({ isMobile }) => ({
  border: '1px solid #ccc',
  padding: isMobile ? '2vh 4vw' : '2vh 3vw',
  marginBottom: '1vh',
  borderRadius: '5px',
  backgroundColor: '#fafafa',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
}));

const GameDetail = styled.p(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  marginBottom: '0.5vh',
}));

const Thumbnail = styled.img(({ isMobile }) => ({
  maxWidth: isMobile ? '50vw' : '10vw',
  marginTop: '0.5vh',
}));

const EditGameActions = styled.div(({ isMobile }) => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '1vw',
}));

const SessionAction = styled.div(({ isMobile }) => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '1vw',
  marginTop: isMobile ? '1vh' : '0',
}));

const NoGamesText = styled.p(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
  textAlign: 'center',
}));

const ModalContainer = styled.div(({ isMobile }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: isMobile ? '3vh 5vw' : '2vh 3vw',
  border: '1px solid #ccc',
  zIndex: '1000',
  width: isMobile ? '80vw' : '30vw',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  borderRadius: '8px',
}));

const ModalTitle = styled.h3(({ isMobile }) => ({
  fontSize: isMobile ? '1.5rem' : '2.5vh',
  fontWeight: '600',
  color: '#333',
  marginBottom: '2vh',
  textAlign: 'center',
}));

const InputGroup = styled.div(() => ({
  marginBottom: '1.5vh',
  textAlign: 'left',
  width: '100%',
}));

const Label = styled.label(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.5vh',
  color: '#555',
  marginBottom: '0.5vh',
  display: 'block',
}));

const Input = styled.input(({ isMobile }) => ({
  width: '100%',
  padding: isMobile ? '2vh 2vw' : '1vh 1vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
}));

const FileInput = styled.input(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
}));

const ModalButtonContainer = styled.div(({ isMobile }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '2vh',
  gap: isMobile ? '2vw' : '1vw',
}));

const SessionModalContent = styled.div(() => ({
  textAlign: 'center',
}));

const SessionModalText = styled.p(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  marginBottom: '1vh',
}));

const GameName = styled.p(({ isMobile }) => ({
  fontSize: isMobile ? '1.5rem' : '2.2vh',
  marginBottom: '20px',
}));

const CopySuccessText = styled.p(({ isMobile }) => ({
  fontSize: isMobile ? '0.9rem' : '1vh',
  color: '#28a745',
  marginTop: '1vh',
  textAlign: 'center',
}));

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

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
          oldSessions: game.oldSessions || [],
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
              points: q.points || 1,
              img: q.image || ''
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
      if (!Array.isArray(jsonData)) {
        throw new Error('JSON must be an array of questions.');
      }
      if (jsonData.length === 0) {
        throw new Error('JSON must contain at least one question.');
      }

      jsonData.forEach((q, index) => {
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

  // Handle delete game with confirmation modal
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

    setGameToDelete(gameId);
    setShowDeleteModal(true);
  };

  // Confirm deletion
  const confirmDeleteGame = () => {
    const updatedGames = games
      .filter(game => game.gameId !== Number(gameToDelete))
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
    setShowDeleteModal(false);
    setGameToDelete(null);
  };

  // Cancel deletion
  const cancelDeleteGame = () => {
    setShowDeleteModal(false);
    setGameToDelete(null);
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

    if (selectedFile) {
      try {
        const jsonContent = await selectedFile.text();
        const jsonData = JSON.parse(jsonContent);
        if (!validateJson(jsonData)) {
          return;
        }

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
        setError('Failed to connect to the server. Please try again.');
      }
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
        setShowGameSessionId('');
        fetchGames();
        navigate(`/session/${games.find(g => g.gameId === id).active}`, { state: { gameId: id, questions: games.find(g => g.gameId === id).questions } });
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
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show game
  const showGame = async (targetId) => {
    navigate(`/session/${games.find(g => g.gameId === targetId).active}`, { state: { gameId: targetId, questions: games.find(g => g.gameId === targetId).questions } });
  };

  // Handle copy link with success message
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/play/${showGameSessionId}`);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  // Call fetchGames when the component mounts
  useEffect(() => {
    fetchGames();
  }, []);

  
}

export default Dashboard;