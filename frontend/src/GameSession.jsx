import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


function GameSession() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch game data on mount
  useEffect(() => {
    if (!token) {
      setError('No token found. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timeout);
    }
  }, [token, navigate]);


  return (
    <>
        HI
    </>
  );
}

export default GameSession;