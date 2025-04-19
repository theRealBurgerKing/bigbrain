import React from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);



const processData = (results,question) => {

  const scores = results.map((user) => {
    let score = 0;

    user.answers.forEach((ans, index) => {
      if (ans.correct) {
        console.log(question[index])
        score += question[index].points;
      }
    });
    return {
      name: user.name,
      score,
    };
  });

  const maxQuestions = Math.max(...results.map(u => u.answers.length));

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

  const totalUsers = results.length;
  const correctPercentages = questionCorrectCounts.map(c => (c / totalUsers * 100).toFixed(2));

  const averageResponseTimes = questionAnswerTimes.map(times => {
    if (!times.length) return 0;
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
  });

  console.log(scores)
  return { scores, correctPercentages, averageResponseTimes };
};

const Results = ({ data, question }) => {
  const { scores, correctPercentages, averageResponseTimes } = processData(data.results,question);
  const top5 = scores.sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Top 5 用户得分</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>用户</th>
              <th>分数</th>
            </tr>
          </thead>
          <tbody>
            {top5.map((user, idx) => (
              <tr key={idx}>
                <td>{user.name}</td>
                <td>{user.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">答对人数百分比（每题）</h2>
        <Bar
          data={{
            labels: correctPercentages.map((_, i) => `问题 ${i + 1}`),
            datasets: [
              {
                label: "% 正确率",
                data: correctPercentages,
                backgroundColor: "#3b82f6",
              },
            ],
          }}
          options={{ scales: { y: { beginAtZero: true, max: 100 } } }}
        />
      </div>

      <div className="border p-4 rounded-lg shadow-lg md:col-span-2">
        <h2 className="text-xl font-bold mb-4">平均回答时间（秒）</h2>
        <Line
          data={{
            labels: averageResponseTimes.map((_, i) => `问题 ${i + 1}`),
            datasets: [
              {
                label: "平均响应时间 (s)",
                data: averageResponseTimes,
                fill: false,
                borderColor: "#10b981",
                tension: 0.3,
              },
            ],
          }}
          options={{ scales: { y: { beginAtZero: true } } }}
        />
      </div>
    </div>
  );
};

export default Results;
