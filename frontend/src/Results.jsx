import { Bar, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import useMediaQuery from '@mui/material/useMediaQuery';
import styled from 'styled-components';

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const processData = (results, question) => {
  const maxQuestions = Math.max(0, ...results.map(u => u.answers.length));

  const questionCorrectCounts = Array(maxQuestions).fill(0);
  const questionAnswerTimes = Array(maxQuestions).fill([]);

  results.forEach((user) => {
    user.answers.forEach((ans, idx) => {
      if (ans.correct) questionCorrectCounts[idx]++;
      if (ans.questionStartedAt && ans.answeredAt) {
        const start = new Date(ans.questionStartedAt);
        const end = new Date(ans.answeredAt);
        const time = (end - start) / 1000;
        questionAnswerTimes[idx] = [...(questionAnswerTimes[idx] || []), time];
      }
    });
  });

  const scores = results.map((user, idx) => {
    let score = 0;
    user.answers.forEach((ans, index) => {
      if (ans.correct) {
        score += Math.log10(1 + question[index].duration - questionAnswerTimes[index][idx]) * question[index].points;
      }
    });
    return {
      name: user.name,
      score,
    };
  });

  const totalUsers = results.length;
  const correctPercentages = questionCorrectCounts.map(c => (c / totalUsers * 100).toFixed(2));

  const averageResponseTimes = questionAnswerTimes.map(times => {
    if (!times.length) return 0;
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
  });

  return { scores, correctPercentages, averageResponseTimes };
};

const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  padding: isMobile ? '1rem' : '1.5rem',
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
  gap: isMobile ? '1rem' : '1.5rem',
}));

const Section = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  border: '1px solid #e5e7eb',
  padding: isMobile ? '0.75rem' : '1rem',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const FullWidthSection = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  border: '1px solid #e5e7eb',
  padding: isMobile ? '0.75rem' : '1rem',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  gridColumn: isMobile ? 'span 1' : 'span 2',
}));

const Heading = styled.h2.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  fontSize: isMobile ? '1.25rem' : '1.5rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
  color: '#333',
}));

const Table = styled.table.withConfig({
  shouldForwardProp: (prop) => !['isMobile'].includes(prop),
})(({ isMobile }) => ({
  width: '100%',
  textAlign: 'left',
  fontSize: isMobile ? '0.875rem' : '1rem',
}));

const Results = ({ data, question }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { scores, correctPercentages, averageResponseTimes } = processData(data.results, question);
  const top5 = scores.sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <Container isMobile={isMobile} role="region" aria-label="Game session results">
      <Section isMobile={isMobile}>
        <Heading isMobile={isMobile} id="top-5-heading">Top 5</Heading>
        <Table isMobile={isMobile} aria-describedby="top-5-heading">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {top5.map((user, idx) => (
              <tr key={idx}>
                <td>{user.name}</td>
                <td>{user.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section isMobile={isMobile}>
        <Heading isMobile={isMobile} id="accuracy-heading">Accuracy</Heading>
        <Line
          data={{
            labels: correctPercentages.map((_, i) => `Question ${i + 1}`),
            datasets: [
              {
                label: "% Accuracy",
                data: correctPercentages,
                fill: false,
                borderColor: "#10b981",
                tension: 0.3,
              },
            ],
          }}
          options={{
            scales: {
              y: { beginAtZero: true, max: 100 },
              x: { title: { display: true, text: 'Questions' } },
              yAxes: { title: { display: true, text: '% Accuracy' } },
            },
            plugins: {
              legend: { display: true, labels: { usePointStyle: true } },
              title: { display: false },
            },
            accessibility: {
              enabled: true,
              description: "Line chart showing the percentage accuracy for each question in the game session.",
            },
          }}
          aria-label="Line chart of percentage accuracy per question"
          role="img"
        />
      </Section>

      <FullWidthSection isMobile={isMobile}>
        <Heading isMobile={isMobile} id="response-time-heading">Average Response Time (seconds)</Heading>
        <Bar
          data={{
            labels: averageResponseTimes.map((_, i) => `Question ${i + 1}`),
            datasets: [
              {
                label: "Average response time (s)",
                data: averageResponseTimes,
                backgroundColor: "#3b82f6",
              },
            ],
          }}
          options={{
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Seconds' } },
              x: { title: { display: true, text: 'Questions' } },
            },
            plugins: {
              legend: { display: true, labels: { usePointStyle: true } },
              title: { display: false },
            },
            accessibility: {
              enabled: true,
              description: "Bar chart showing the average response time in seconds for each question in the game session.",
            },
          }}
          aria-label="Bar chart of average response time per question in seconds"
          role="img"
        />
      </FullWidthSection>
    </Container>
  );
};

export default Results;