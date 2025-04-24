import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';
import useMediaQuery from '@mui/material/useMediaQuery';
import styled from 'styled-components';

const Container = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100%',
  padding: '0px',
  margin: '0px',
}));

const Editor = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '90vw' : '50vw',
  padding: isMobile ? '2vh 4vw' : '2vh 3vw',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  margin: '2vh 0',
}));

const Title = styled.h2.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '2rem' : '3vh',
  fontWeight: '600',
  color: '#333',
  marginBottom: '2vh',
}));

const Subtitle = styled.h3.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1.5rem' : '2.5vh',
  fontWeight: '500',
  color: '#333',
  marginBottom: '2vh',
  textAlign: 'left',
}));

const ButtonContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginBottom: '2vh',
  textAlign: 'center',
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '1vw',
  justifyContent: 'center',
}));

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'isLoading'].includes(prop),
})(({ isMobile, isLoading }) => ({
  padding: isMobile ? '1.5vh 4vw' : '1vh 2vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: isLoading ? '#a3bffa' : '#3b82f6',
  border: 'none',
  borderRadius: '4px',
  cursor: isLoading ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.3s, transform 0.1s',
}));

const DeleteButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'disabled'].includes(prop),
})(({ isMobile, disabled }) => ({
  padding: isMobile ? '1.5vh 4vw' : '1vh 2vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: disabled ? '#f87171' : '#dc2626',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.3s, transform 0.1s',
}));

const LoadingText = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  textAlign: 'center',
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
}));

const ErrorText = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  color: 'red',
  fontSize: isMobile ? '1rem' : '1.8vh',
  marginBottom: '1vh',
  textAlign: 'center',
}));

const GameNotFoundText = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
  textAlign: 'center',
}));

const QuestionNotFoundText = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
  textAlign: 'center',
}));

const QuestionList = styled.ul(() => ({
  listStyle: 'none',
  padding: '0',
  margin: '0',
}));

const QuestionItem = styled.li.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  padding: isMobile ? '1.5vh 2vw' : '1vh 1vw',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5vh',
  borderBottom: '1px solid #eee',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '0',
}));

const QuestionText = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#333',
}));

const NoQuestionsText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
}));

const InputGroup = styled.div(() => ({
  marginBottom: '1.5vh',
  textAlign: 'left',
}));

const AnswerGroup = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginBottom: '0.5vh',
  display: 'flex',
  alignItems: 'center',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '1vw',
}));

const Label = styled.label.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.5vh',
  color: '#555',
  marginBottom: '0.5vh',
  display: 'block',
}));

const CorrectLabel = styled.label.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: isMobile ? '0' : '1vw',
}));

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '80vw' : '25vw',
  padding: isMobile ? '2vh 2vw' : '1vh 1vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  marginLeft: isMobile ? '0' : '1vw',
}));

const CorrectInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginRight: '0.5vw',
}));

const Select = styled.select.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '80vw' : '25vw',
  padding: isMobile ? '2vh 2vw' : '1vh 1vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  marginLeft: isMobile ? '0' : '1vw',
}));

const NumberInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '80vw' : '10vw',
  padding: isMobile ? '2vh 2vw' : '1vh 1vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  marginLeft: isMobile ? '0' : '1vw',
}));

const AnswerInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '80vw' : '20vw',
  padding: isMobile ? '2vh 2vw' : '1vh 1vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  marginLeft: isMobile ? '0' : '1vw',
  marginRight: isMobile ? '0' : '1vw',
}));

const FileInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
  marginLeft: isMobile ? '0' : '1vw',
}));

const Thumbnail = styled.img.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  maxWidth: isMobile ? '50vw' : '10vw',
  marginTop: '0.5vh',
}));

const ModalText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#333',
  textAlign: 'center',
}));

function QuestionEditor() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [showModal, setShowModal] = useState(false);
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

  const isMobile = useMediaQuery('(max-width: 768px)');

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
      answers: type === 'judgement' ? ['True', 'False'] : ['', ''],
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
    const updatedGames = games.map((g) =>
      g.gameId === gameId
        ? {
          ...g,
          questions: g.questions.filter((q) => q.id !== questionId),
        }
        : g
    );
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
    if (type !== 'judgement') {
      const newAnswers = [...answers];
      newAnswers[index] = value;
      setAnswers(newAnswers);
    }
  };

  // Add new answer option
  const addAnswer = () => {
    if (type !== 'judgement' && answers.length < 6) {
      setAnswers([...answers, '']);
    } else if (answers.length >= 6) {
      setModalError('Maximum 6 answers allowed.');
      setShowModal(true);
    }
  };

  // Remove answer option
  const removeAnswer = (index) => {
    if (type !== 'judgement' && answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
      setCorrectAnswers(correctAnswers.filter((answerIndex) => answerIndex !== index.toString()));
    } else if (type !== 'judgement') {
      setModalError('Minimum 2 answers required.');
      setShowModal(true);
    }
  };

  // Handle correct answer toggle (for multiple choice and single choice)
  const toggleCorrectAnswer = (index) => {
    if (type === 'single choice' || type === 'judgement') {
      setCorrectAnswers([index.toString()]);
    } else if (type === 'multiple choice') {
      if (correctAnswers.includes(index.toString())) {
        setCorrectAnswers(correctAnswers.filter((i) => i !== index.toString()));
      } else {
        setCorrectAnswers([...correctAnswers, index.toString()]);
      }
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update games on the backend
  const updateGames = async (updatedGames) => {
    if (!token) {
      setModalError('No token found. Please log in again.');
      setShowModal(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
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
        setGames(updatedGames);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setModalError('Session expired. Please log in again.');
          setShowModal(true);
          localStorage.removeItem('token');
          localStorage.removeItem('myusername');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setModalError('Forbidden: You do not have permission to update this game.');
          setShowModal(true);
        } else {
          setModalError(err.response.data?.error || 'An error occurred while updating the question.');
          setShowModal(true);
        }
      } else {
        setModalError('Failed to connect to the server.');
        setShowModal(true);
      }
    }
  };

  // Handle save question
  const handleSave = async () => {
    if (!token) {
      setModalError('No token found. Please log in again.');
      setShowModal(true);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!text.trim()) {
      setModalError('Question text is required.');
      setShowModal(true);
      return;
    }

    if (duration < 1) {
      setModalError('Time limit must be at least 1 second.');
      setShowModal(true);
      return;
    }

    if (points < 1) {
      setModalError('Points must be at least 1.');
      setShowModal(true);
      return;
    }

    if (type !== 'judgement' && (answers.length < 2 || answers.length > 6)) {
      setModalError('Answers must be between 2 and 6.');
      setShowModal(true);
      return;
    }

    if (type === 'single choice' && correctAnswers.length !== 1) {
      setModalError('Single choice questions must have exactly one correct answer.');
      setShowModal(true);
      return;
    }

    if (type === 'multiple choice' && correctAnswers.length < 1) {
      setModalError('Multiple choice questions must have at least one correct answer.');
      setShowModal(true);
      return;
    }

    if (type === 'judgement' && correctAnswers.length !== 1) {
      setModalError('Judgement questions must have exactly one correct answer (True or False).');
      setShowModal(true);
      return;
    }

    setIsLoading(true);
    setModalError('');

    try {
      const updatedGames = games.map((g) =>
        g.gameId === gameId
          ? {
            ...g,
            questions: g.questions.map((q) =>
              q.id === questionId
                ? {
                  id: q.id,
                  text: text,
                  type: type,
                  duration: Number(duration),
                  points: Number(points),
                  youtubeUrl: youtubeUrl,
                  image: image,
                  answers: type === 'judgement' ? ['True', 'False'] : answers,
                  correctAnswers: type !== 'judgement' ? correctAnswers : correctAnswers,
                }
                : q
            ),
          }
        : g
      );

      await updateGames(updatedGames);
      navigate(`/game/${gameId}/questions`);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setModalError('Session expired. Please log in again.');
          setShowModal(true);
          localStorage.removeItem('token');
          localStorage.removeItem('myusername');
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response.status === 403) {
          setModalError('Forbidden: You do not have permission to update this game.');
          setShowModal(true);
        } else {
          setModalError(err.response.data?.error || 'An error occurred while updating the question.');
          setShowModal(true);
        }
      } else {
        setModalError('Failed to connect to the server.');
        setShowModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingText isMobile={isMobile}>Loading...</LoadingText>;
  if (error) return <ErrorText isMobile={isMobile}>{error}</ErrorText>;

  // If no questionId is provided, show the question list
  if (!questionId) {
    if (!game) return <GameNotFoundText isMobile={isMobile}>Game not found.</GameNotFoundText>;

    return (
      <Container>
        <Editor isMobile={isMobile}>
          <Title isMobile={isMobile}>Questions for Game: {game.name}</Title>
          {error && <ErrorText isMobile={isMobile}>{error}</ErrorText>}
          <ButtonContainer isMobile={isMobile}>
            <Button
              isMobile={isMobile}
              isLoading={false}
              onClick={() => navigate(`/game/${gameId}`)}
              aria-label="Return to game editor"
            >
              Back to Game Editor
            </Button>
          </ButtonContainer>

          <InputGroup>
            {game.questions.length > 0 ? (
              <QuestionList>
                {game.questions.map((q) => (
                  <QuestionItem key={q.id} isMobile={isMobile}>
                    <QuestionText
                      isMobile={isMobile}
                      onClick={() => handleEditQuestion(q.id)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleEditQuestion(q.id)}
                      aria-label={`Edit question: ${q.text || 'Untitled Question'}`}
                    >
                      {q.text || 'Untitled Question'}
                    </QuestionText>
                    <DeleteButton
                      isMobile={isMobile}
                      disabled={false}
                      onClick={() => handleDeleteQuestion(q.id)}
                      aria-label={`Delete question: ${q.text || 'Untitled Question'}`}
                    >
                      Delete
                    </DeleteButton>
                  </QuestionItem>
                ))}
              </QuestionList>
            ) : (
              <NoQuestionsText isMobile={isMobile}>No questions yet. Click "Add Question" to start.</NoQuestionsText>
            )}
            <Button
              isMobile={isMobile}
              isLoading={false}
              onClick={handleAddQuestion}
              aria-label="Add a new question"
            >
              Add Question
            </Button>
          </InputGroup>
        </Editor>
      </Container>
    );
  }

  // If questionId is provided, show the question editor
  if (!question) return <QuestionNotFoundText isMobile={isMobile}>Question not found.</QuestionNotFoundText>;

  return (
    <Container>
      <Editor isMobile={isMobile}>
        <Title isMobile={isMobile}>Edit Question</Title>
        {error && <ErrorText isMobile={isMobile}>{error}</ErrorText>}

        <InputGroup>
          <Label id="questionTypeLabel" isMobile={isMobile}>
            Question Type:
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCorrectAnswers([]);
                if (e.target.value === 'judgement') {
                  setAnswers(['True', 'False']);
                } else if (e.target.value === 'multiple choice') {
                  setAnswers(['', '']);
                } else if (e.target.value === 'single choice') {
                  setAnswers(['', '']);
                }
              }}
              isMobile={isMobile}
              aria-label="Select question type"
              aria-describedby="questionTypeLabel"
            >
              <option value="multiple choice">Multiple Choice</option>
              <option value="single choice">Single Choice</option>
              <option value="judgement">Judgement</option>
            </Select>
          </Label>
        </InputGroup>

        <InputGroup>
          <Label id="questionTextLabel" isMobile={isMobile}>
            Question:
            <Input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter question"
              isMobile={isMobile}
              required
              aria-label="Question text"
              aria-describedby="questionTextLabel"
            />
          </Label>
        </InputGroup>

        <InputGroup>
          <Label id="timeLimitLabel" isMobile={isMobile}>
            Time Limit (seconds):
            <NumberInput
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              isMobile={isMobile}
              required
              aria-label="Time limit in seconds"
              aria-describedby="timeLimitLabel"
            />
          </Label>
        </InputGroup>

        <InputGroup>
          <Label id="pointsLabel" isMobile={isMobile}>
            Points:
            <NumberInput
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              isMobile={isMobile}
              required
              aria-label="Points for the question"
              aria-describedby="pointsLabel"
            />
          </Label>
        </InputGroup>

        <InputGroup>
          <Label id="youtubeUrlLabel" isMobile={isMobile}>
            YouTube URL (optional):
            <Input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              isMobile={isMobile}
              aria-label="YouTube URL (optional)"
              aria-describedby="youtubeUrlLabel"
            />
          </Label>
        </InputGroup>

        <InputGroup>
          <Label id="imageUploadLabel" isMobile={isMobile}>
            Image (optional):
            <FileInput
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              isMobile={isMobile}
              aria-label="Upload image for the question (optional)"
              aria-describedby="imageUploadLabel"
            />
          </Label>
          {image && (
            <Thumbnail
              src={image}
              alt="Question image"
              isMobile={isMobile}
              loading="lazy"
            />
          )}
        </InputGroup>

        <InputGroup>
          <Subtitle isMobile={isMobile}>Answers</Subtitle>
          {answers.map((answer, index) => (
            <AnswerGroup key={index} isMobile={isMobile}>
              <Label id={`answerLabel-${index}`} isMobile={isMobile}>
                Answer {index + 1}:
                <AnswerInput
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  disabled={type === 'judgement'}
                  isMobile={isMobile}
                  aria-label={`Answer ${index + 1}`}
                  aria-describedby={`answerLabel-${index}`}
                />
              </Label>
              <CorrectLabel isMobile={isMobile}>
                <CorrectInput
                  type={type === 'multiple choice' ? 'checkbox' : 'radio'}
                  checked={correctAnswers.includes(index.toString())}
                  onChange={() => toggleCorrectAnswer(index)}
                  isMobile={isMobile}
                  aria-label={`Mark answer ${index + 1} as correct`}
                />
                Correct
              </CorrectLabel>
              {type !== 'judgement' && (
                <DeleteButton
                  isMobile={isMobile}
                  disabled={answers.length <= 2}
                  onClick={() => removeAnswer(index)}
                  aria-label={`Remove answer ${index + 1}`}
                >
                  Remove
                </DeleteButton>
              )}
            </AnswerGroup>
          ))}
          {type !== 'judgement' && (
            <Button
              isMobile={isMobile}
              isLoading={false}
              disabled={answers.length >= 6}
              onClick={addAnswer}
              aria-label="Add a new answer option"
            >
              Add Answer
            </Button>
          )}
        </InputGroup>

        <ButtonContainer isMobile={isMobile}>
          <Button
            isMobile={isMobile}
            isLoading={isLoading}
            onClick={handleSave}
            disabled={isLoading}
            aria-label={isLoading ? "Saving question" : "Save question"}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button
            isMobile={isMobile}
            isLoading={false}
            onClick={() => navigate(`/game/${gameId}/questions`)}
            aria-label="Cancel editing question"
          >
            Cancel
          </Button>
        </ButtonContainer>

        {/* Modal for displaying errors */}
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <ModalText isMobile={isMobile}>{modalError}</ModalText>
          </Modal>
        )}
      </Editor>
    </Container>
  );
}

export default QuestionEditor;