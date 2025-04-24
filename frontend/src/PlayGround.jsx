import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';
import { animate, stagger } from 'animejs';
import useMediaQuery from '@mui/material/useMediaQuery';
import styled from 'styled-components';

const Container = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  minHeight: '40vh',
  width: '100%',
  padding: '0px',
  margin: '0px',
  marginTop: '20vh',
}));

const Box = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '90vw' : '30vw',
  padding: isMobile ? '2vh 4vw' : '2vh 3vw',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  margin: '2vh 0',
}));

const Title = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '2.5rem' : '4vh',
  fontWeight: '600',
  color: '#333',
  marginBottom: '2vh',
}));

const Subtitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1.5rem' : '2.5vh',
  fontWeight: '500',
  color: '#333',
  marginBottom: '2vh',
  textAlign: 'left',
}));

const Text = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#555',
  marginBottom: '0.5vh',
}));

const Thumbnail = styled.img.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  maxWidth: isMobile ? '80vw' : '20vw',
  marginBottom: '1vh',
  borderRadius: '8px',
}));

const InputGroup = styled.div(() => ({
  marginBottom: '1.5vh',
  textAlign: 'left',
}));

const Label = styled.label.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.5vh',
  color: '#555',
  marginBottom: '0.5vh',
  marginTop: '5vh',
  display: 'block',
}));

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '80vw' : '20vw',
  padding: isMobile ? '2vh 2vw' : '1vh 1vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  marginLeft: isMobile ? '0' : '1.5vw',
}));

const AnswerList = styled.ul(() => ({
  listStyle: 'none',
  padding: '0',
  margin: '0',
}));

const AnswerItem = styled.li.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  padding: isMobile ? '1.5vh 2vw' : '1vh 1vw',
  borderRadius: '5px',
  marginBottom: '0.5vh',
}));

const ButtonContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  marginTop: '2vh',
  textAlign: 'center',
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: isMobile ? '1vh' : '1vw',
  justifyContent: 'center',
}));

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'disabled'].includes(prop),
})(({ isMobile, disabled }) => ({
  padding: isMobile ? '1.5vh 4vw' : '1vh 2vw',
  fontSize: isMobile ? '1rem' : '1.8vh',
  fontWeight: '500',
  color: '#fff',
  backgroundColor: disabled ? '#a3bffa' : '#3b82f6',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.3s, transform 0.1s',
}));

const ResultList = styled.ul(() => ({
  listStyle: 'none',
  padding: '0',
  margin: '0',
}));

const ResultItem = styled.li.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  padding: isMobile ? '1.5vh 2vw' : '1vh 1vw',
  marginBottom: '0.5vh',
  borderBottom: '1px solid #eee',
}));

const LobbyContainer = styled.section.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  textAlign: 'center',
}));

const LobbyTitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '2rem' : '3vh',
  fontWeight: '600',
  color: '#333',
  marginBottom: '2vh',
}));

const LobbyText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1.2rem' : '2vh',
  color: '#555',
  marginBottom: '1vh',
}));

const SquareContainer = styled.div(() => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '2vh',
}));

const Square = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: isMobile ? '20px' : '30px',
  height: isMobile ? '20px' : '30px',
  backgroundColor: '#3b82f6',
  margin: isMobile ? '0 3px' : '0 5px',
}));

const ModalText = styled.p.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1rem' : '1.8vh',
  color: '#333',
  textAlign: 'center',
}));

function PlayGround() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [error, setError] = useState('');
  const [player, setPlayer] = useState('');
  const [playerId, setPlayerId] = useState(searchParams.get('playerId'));
  const [active, setActive] = useState(false);
  const [finish, setFinish] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState({});
  const [timeLeft, setTimeLeft] = useState(-1);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const prevActiveRef = useRef(active);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const attendGame = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5005/play/join/${sessionId}/`,
        { "name": player }
      );
      if (response.status === 200) {
        setPlayerId(response.data.playerId);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data.error);
          const timeout = setTimeout(() => navigate('/play'), 2000);
          return () => clearTimeout(timeout);
        } else {
          setError(err.response.data.error || 'An error occurred');
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      attendGame();
    }
  };

  const fetchActive = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/play/${playerId}/status`
      );
      if (response.status === 200) {
        setActive(response.data.started);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.data.error === "Session ID is not an active session") {
          setActive(false);
          setFinish(true);
        } else {
          setError(err.response.data.error);
        }
      }
    }
  };

  const fetchAnswer = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5005/play/${playerId}/answer`
      );
      if (response.status === 200) {
        setCorrectAnswers(response.data.answers);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      }
    }
  };

  const fetchQuestion = async () => {
    try {
      const q = await axios.get(
        `http://localhost:5005/play/${playerId}/question`
      );
      if (q.status === 200) {
        setQuestions(prevQuestions => {
          if (!prevQuestions.some(existingQuestion => existingQuestion.id === q.data.question.id)) {
            const updatedQuestions = [...prevQuestions, q.data.question];
            setQuestion(q.data.question);
            setCorrectAnswers([]);
            setSelectedAnswers([]);
            setCurrentQuestionIndex(questions.length);
            return updatedQuestions;
          } else {
            setQuestion(q.data.question);
            return prevQuestions;
          }
        });

        const startTime = new Date(q.data.question.isoTimeLastQuestionStarted).getTime();
        const duration = q.data.question.duration * 1000;
        const now = Date.now();
        const remainingTime = Math.max(0, Math.floor((startTime + duration - now) / 1000));
        setTimeLeft(remainingTime);
        if (remainingTime === 0) {
          fetchAnswer();
        } else {
          setCorrectAnswers([]);
        }
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      }
    }
  };

  const handleAnswerSelect = (index) => {
    const strIndex = index.toString();
    if (question.type === 'multiple choice') {
      setSelectedAnswers((prev) => {
        let updated;
        if (prev.includes(strIndex)) {
          updated = prev.filter((i) => i !== strIndex);
        } else {
          updated = [...prev, strIndex];
        }
        return updated.sort((a, b) => Number(a) - Number(b));
      });
    } else {
      setSelectedAnswers([index.toString()]);
    }
  };

  const submitQuestion = async () => {
    setError('');
    try {
      const q = await axios.put(
        `http://localhost:5005/play/${playerId}/answer`,
        {
          "answers": selectedAnswers
        }
      );
      if (q.status === 200) {
        setSubmitSuccess(true);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      }
    }
  };

  const fetchScore = async () => {
    setResults([]);
    try {
      const response = await axios.get(
        `http://localhost:5005/play/${playerId}/results`
      );
      if (response.status === 200) {
        let sumScore = 0;
        response.data.forEach((ans, index) => {
          let timeDifference = questions[index].duration;
          if (ans.questionStartedAt && ans.answeredAt) {
            const questionStartTime = new Date(ans.questionStartedAt);
            const answerTime = new Date(ans.answeredAt);
            timeDifference = ((answerTime - questionStartTime) / 1000).toFixed(2);
          }
          let score = 0;
          if (ans.correct) {
            score = Math.log10(1 + questions[index].duration - timeDifference) * questions[index].points;
            sumScore += score;
          }
          const result = {
            questionId: questions[index].id,
            timeDifference: timeDifference,
            score: score.toFixed(2),
            correct: ans.correct,
          };
          setResults(prevResults => [...prevResults, result]);
        });
        setTotal(sumScore.toFixed(2));
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      }
    }
  };

  useEffect(() => {
    if (!playerId || finish) return;
    const intervalId = setInterval(() => {
      fetchActive();
    }, 10);

    return () => clearInterval(intervalId);
  }, [playerId, finish]);

  useEffect(() => {
    if (!active) return;
    const intervalId = setInterval(() => {
      setError('');
      fetchQuestion();
    }, 100);

    return () => clearInterval(intervalId);
  }, [active]);

  useEffect(() => {
    if (prevActiveRef.current && !active) {
      setError('');
      fetchScore();
    }
    prevActiveRef.current = active;
  }, [active]);

  useEffect(() => {
    if (question && question.id) {
      setSelectedAnswers([]);
      setCorrectAnswers([]);
    }
  }, [question.id, questions]);

  useEffect(() => {
    if (playerId && !active && !finish) {
      animate('.square', {
        x: 320,
        rotate: { from: -180 },
        duration: 1250,
        delay: stagger(65, { from: 'center' }),
        ease: 'inOutQuint',
        loop: true,
        alternate: true
      });
    }
  }, [playerId, active, finish]);

  return (
    <Container>
      <Box isMobile={isMobile}>
        <Title isMobile={isMobile}>Play Ground</Title>
        {!playerId && (
          <InputGroup>
            <Subtitle isMobile={isMobile}>Game: {sessionId || 'Unknown'}</Subtitle>
            <Label id="playerNameLabel" isMobile={isMobile}>
              Name:
              <Input
                isMobile={isMobile}
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                required
                aria-label="Player name"
                aria-describedby="playerNameLabel"
              />
            </Label>
            <ButtonContainer isMobile={isMobile}>
              <Button
                isMobile={isMobile}
                disabled={false}
                onClick={attendGame}
                aria-label="Join the game"
              >
                Attend the game!
              </Button>
              <Button
                isMobile={isMobile}
                disabled={false}
                onClick={() => navigate('/play')}
                aria-label="Return to game selection screen"
              >
                Back
              </Button>
            </ButtonContainer>
          </InputGroup>
        )}

        {playerId && !active && !finish && (
          <LobbyContainer isMobile={isMobile} aria-labelledby="lobby-title">
            <LobbyTitle isMobile={isMobile}>Welcome to the Game Lobby!</LobbyTitle>
            <SquareContainer>
              <Square className="square" isMobile={isMobile} aria-hidden="true" />
              <Square className="square" isMobile={isMobile} aria-hidden="true" />
              <Square className="square" isMobile={isMobile} aria-hidden="true" />
              <Square className="square" isMobile={isMobile} aria-hidden="true" />
              <Square className="square" isMobile={isMobile} aria-hidden="true" />
            </SquareContainer>
            <LobbyText isMobile={isMobile} aria-live="polite">Please wait for the game to start...</LobbyText>
            <ButtonContainer isMobile={isMobile}>
              <Button
                isMobile={isMobile}
                disabled={false}
                onClick={() => navigate('/play')}
                aria-label="Return to game selection screen"
              >
                Back
              </Button>
            </ButtonContainer>
          </LobbyContainer>
        )}

        {playerId && active && question && question.answers && (
          <>
            <Subtitle isMobile={isMobile}>
              Question {currentQuestionIndex + 1}: {question.text}
            </Subtitle>
            {question.image && (
              <Thumbnail
                src={question.image}
                alt={`Image for question ${currentQuestionIndex + 1}`}
                isMobile={isMobile}
                loading="lazy"
              />
            )}
            <Text isMobile={isMobile}>
              URL: <a href={question.youtubeUrl} aria-label={`Watch the video for question ${currentQuestionIndex + 1}`}>{question.youtubeUrl}</a>
            </Text>
            <Text isMobile={isMobile}>
              Score: {question.points}
            </Text>
            <Text isMobile={isMobile}>
              Time: {timeLeft}
            </Text>
            {question.answers.length > 0 ? (
              <AnswerList>
                {question.answers.map((ans, index) => {
                  const indexStr = index.toString();
                  const isCorrect = correctAnswers?.includes(indexStr);
                  return (
                    <AnswerItem
                      key={index}
                      isMobile={isMobile}
                      style={isCorrect ? { backgroundColor: 'lightgreen' } : {}}
                    >
                      <input
                        type={question.type === 'multiple choice' ? 'checkbox' : 'radio'}
                        name="ans"
                        checked={selectedAnswers.includes(indexStr)}
                        onChange={() => handleAnswerSelect(indexStr)}
                        disabled={timeLeft <= 0}
                        aria-label={`Option ${index + 1}: ${ans}`}
                        id={`answer-${index}`}
                      />
                      <label htmlFor={`answer-${index}`}>{ans}</label>
                    </AnswerItem>
                  );
                })}
              </AnswerList>
            ) : (
              <Text isMobile={isMobile}>No questions yet.</Text>
            )}
            <ButtonContainer isMobile={isMobile}>
              <Button
                isMobile={isMobile}
                disabled={timeLeft <= 0}
                onClick={() => submitQuestion()}
                aria-label="Submit your answer"
              >
                Submit
              </Button>
              <Button
                isMobile={isMobile}
                disabled={false}
                onClick={() => navigate('/play')}
                aria-label="Return to game selection screen"
              >
                Back
              </Button>
            </ButtonContainer>
          </>
        )}

        {finish && (
          <>
            <Subtitle isMobile={isMobile}>Result</Subtitle>
            <Text isMobile={isMobile}>
              <strong>Your score = Σ(lg(1 + timelimit - time that you use) * score)</strong>
            </Text>
            {Array.isArray(results) && results.length > 0 ? (
              <ResultList>
                {results.map((r, index) => (
                  <ResultItem key={index} isMobile={isMobile}>
                    Question: {index + 1} : {r.correct ? 'True' : 'False'}
                    <br />
                    Time cost: {r.timeDifference}s
                    <br />
                    Your score is {r.score}
                  </ResultItem>
                ))}
              </ResultList>
            ) : (
              <Text isMobile={isMobile}>No results available.</Text>
            )}
            <Text isMobile={isMobile}>Total: {total}</Text>
            <ButtonContainer isMobile={isMobile}>
              <Button
                isMobile={isMobile}
                disabled={false}
                onClick={() => navigate('/play')}
                aria-label="Return to game selection screen"
              >
                Back
              </Button>
            </ButtonContainer>
          </>
        )}

        {submitSuccess && (
          <Modal onClose={() => setSubmitSuccess(false)}>
            <ModalText isMobile={isMobile}>Submission successful!</ModalText>
          </Modal>
        )}

      </Box>
    </Container>
  );
}

export default PlayGround;