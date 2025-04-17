import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function QuestionEditor() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [games, setGames] = useState([]);
  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [text, setText] = useState('');
  const [type, setType] = useState('multiple choice');
  const [duration, setDuration] = useState(30);
  const [points, setPoints] = useState(10);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [image, setImage] = useState('');
  const [answers, setAnswers] = useState(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  // Fetch all games on mount
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
            gameId: game.id ? String(game.id) : null,
            owner: game.owner || null,
            name: game.name || 'Untitled Game',
            thumbnail: game.thumbnail || '',
            createdAt: game.createdAt || new Date().toISOString(),
            active: game.active || null,
            questions: Array.isArray(game.questions)
              ? game.questions.map((q, index) => ({
                  id: q.id ? String(q.id) : `${Date.now()}-${index}`,
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
        const gameData = gamesData.find((g) => g.gameId === gameId);
        if (gameData) {
          setGame(gameData);
          if (questionId) {
            const questionData = gameData.questions.find((q) => q.id === questionId);
            if (questionData) {
              setQuestion(questionData);
              setText(questionData.text);
              setType(questionData.type);
              setDuration(questionData.duration || 30);
              setPoints(questionData.points || 10);
              setYoutubeUrl(questionData.youtubeUrl);
              setImage(questionData.image);
              setAnswers(questionData.answers);
              setCorrectAnswers(questionData.correctAnswers);
              setIsCorrect(questionData.isCorrect);
            } else {
              setError('Question not found.');
            }
          }
        } else {
          setError('Game not found.');
        }
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('myusername');
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

  useEffect(() => {
    fetchGames();
  }, [gameId, questionId, token, navigate]);

  // Handle add new question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: '',
      answers: ['', ''],
      type: 'multiple choice',
      duration: 30,
      points: 10,
      youtubeUrl: '',
      image: '',
      correctAnswers: [],
      isCorrect: false,
    };

    const updatedGames = games.map((g) =>
      g.gameId === gameId
        ? { ...g, questions: [...g.questions, newQuestion] }
        : g
    );

    setGames(updatedGames);
    updateGames(updatedGames);
    navigate(`/game/${gameId}/question/${newQuestion.id}`);
  };

  // Handle delete question
  const handleDeleteQuestion = (questionId) => {
    //console.log('Deleting question with ID:', questionId, 'Type:', typeof questionId);
    //console.log('Current questions:', game.questions);
    const updatedGames = games.map((g) =>
      g.gameId === gameId
        ? {
            ...g,
            questions: g.questions.filter((q) => {
              //console.log('Comparing q.id:', q.id, 'with questionId:', questionId, 'Result:', q.id !== questionId);
              return q.id !== questionId;
            }),
          }
        : g
    );
    //console.log('After deletion, updated games:', updatedGames);
    setGames(updatedGames);
    updateGames(updatedGames);
    fetchGames();
  };

  // Handle edit question navigation
  const handleEditQuestion = (questionId) => {
    navigate(`/game/${gameId}/question/${questionId}`);
  };

  // Handle answer change
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  // Add new answer option
  const addAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, '']);
    } else {
      setError('Maximum 6 answers allowed.');
    }
  };

  // Remove answer option
  const removeAnswer = (index) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
      setCorrectAnswers(correctAnswers.filter((answerIndex) => answerIndex !== index.toString()));
    } else {
      setError('Minimum 2 answers required.');
    }
  };

  
}

export default QuestionEditor;