import React from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function GameEditor() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Edit Game</h1>
      <p>Editing game with ID: {gameId}</p>
      <button onClick={() => navigate('/dashboard')}>back</button>
    </div>
  );
}

export default GameEditor;
