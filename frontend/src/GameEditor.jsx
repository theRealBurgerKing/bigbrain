import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const ButtonContainer = styled.section.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginBottom: '2vh',
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '1vw',
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

const InputGroup = styled.section.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginBottom: '1.5vh',
  textAlign: 'left',
}));

const Label = styled.label.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.5vh',
  color: '#555',
  marginBottom: '0.5vh',
  display: 'block',
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

  const isMobile = useMediaQuery('(max-width: 768px)');

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

  if (isLoading) return <LoadingText isMobile={isMobile}>Loading...</LoadingText>;
  if (error) return <ErrorText isMobile={isMobile}>{error}</ErrorText>;
  if (!game) return <GameNotFoundText isMobile={isMobile}>Game not found.</GameNotFoundText>;

  return (
    <Container>
      <Editor isMobile={isMobile}>
        <Title isMobile={isMobile}>Edit Game: {game.name}</Title>
        {error && <ErrorText isMobile={isMobile}>{error}</ErrorText>}
        <ButtonContainer isMobile={isMobile}>
          <Button
            isMobile={isMobile}
            isLoading={false}
            onClick={() => navigate('/dashboard')}
            aria-label="Return to dashboard"
          >
            Back to Dashboard
          </Button>
        </ButtonContainer>
        <InputGroup isMobile={isMobile}>
          <Subtitle isMobile={isMobile}>Edit</Subtitle>
          <Label id="gameNameLabel" isMobile={isMobile}>
            Game Name:
            <Input
              isMobile={isMobile}
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name"
              required
              aria-label="Game Name"
              aria-describedby="gameNameLabel"
            />
          </Label>
          <div>
            <Label id="thumbnailLabel" isMobile={isMobile}>
              Thumbnail:
              <FileInput
                isMobile={isMobile}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                aria-label="Upload game thumbnail"
                aria-describedby="thumbnailLabel"
              />
            </Label>
            {thumbnail && (
              <Thumbnail
                isMobile={isMobile}
                src={thumbnail}
                alt={`Thumbnail for ${gameName || 'game'}`}
                loading="lazy"
              />
            )}
          </div>
          <ButtonContainer isMobile={isMobile}>
            <Button
              isMobile={isMobile}
              isLoading={false}
              onClick={() => navigate(`/game/${gameId}/questions`)}
              aria-label="Edit questions for this game"
            >
              Edit Questions
            </Button>
          </ButtonContainer>
          <ButtonContainer isMobile={isMobile}>
            <Button
              isMobile={isMobile}
              isLoading={isLoading}
              onClick={handleSaveGame}
              disabled={isLoading}
              aria-label="Save game changes"
            >
              Save
            </Button>
          </ButtonContainer>
        </InputGroup>
      </Editor>
    </Container>
  );
}

export default GameEditor;