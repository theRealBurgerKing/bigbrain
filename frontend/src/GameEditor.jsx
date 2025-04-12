import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function GameEditor() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [game, setGame] = useState(null);
  const [gameName, setGameName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState(['', '']);

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
        const response = await axios.get('http://localhost:5005/admin/games', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          const gameData = response.data.games.find(
            (g) => g.id.toString() === gameId
          );
          if (gameData) {
            setGame(gameData);
            setGameName(gameData.name);
            setThumbnail(gameData.thumbnail || '');
            setQuestions(
              gameData.questions.length > 0
                ? gameData.questions
                : [{ id: Date.now(), text: '', answers: ['', ''] }]
            );
          } else {
            setError('Game not found.');
          }
        }
      } catch (err) {
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

  // Select a question to edit
  const selectQuestion = (question) => {
    setSelectedQuestion(question);
    setQuestionText(question.text);
    setAnswers(question.answers || ['', '']);
  };

  // Add a new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      answers: ['', ''],
    };
    setQuestions([...questions, newQuestion]);
    selectQuestion(newQuestion);
  };

  // Delete a question
  const deleteQuestion = (questionId) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(updatedQuestions);
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
      setQuestionText('');
      setAnswers(['', '']);
    }
  };

  // Update selected question
  const updateQuestion = () => {
    if (!selectedQuestion) return;
    const updatedQuestions = questions.map((q) =>
      q.id === selectedQuestion.id
        ? { ...q, text: questionText, answers }
        : q
    );
    setQuestions(updatedQuestions);
    setSelectedQuestion({ ...selectedQuestion, text: questionText, answers });
  };

  // Save game changes
  const saveGame = async () => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedGame = {
        ...game,
        name: gameName,
        thumbnail: thumbnail || undefined,
        questions,
      };
      const response = await axios.put(
        'http://localhost:5005/admin/games',
        { games: [updatedGame] },
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
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Game: {gameName}</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {isLoading && !game ? (
        <div>Loading...</div>
      ) : !game ? (
        <div>Game not found.</div>
      ) : (
        <>
          

          

          
        </>
      )}
    </div>
  );
}

export default GameEditor;