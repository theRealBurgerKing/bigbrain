import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


function GameSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [error, setError] = useState('');
  const [session, setSession] = useState([]);

  const fetchSession = async () => {
    console.log(sessionId)
    if (!token) {
        setError('No token found. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return () => clearTimeout(timeout);
    }
    try {
        const response = await axios.get(`http://localhost:5005/admin/session/${sessionId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
        setSession(response.data.results);
    }
    } catch (err) {
        console.log(err)
        if (err.response) {
            if (err.response.status === 500) {
                setError('No such session is ON.')
                setTimeout(() => navigate('/dashboard'), 2000);
        return () => clearTimeout(timeout);
            } else {
                setError(err.response.data.error);
            }
        }
    } finally {
        console.log('finally')
    }
    }


  // Fetch data on mount
  useEffect(() => {
    fetchSession(sessionId);
  }, []);


  return (
    <>
        HI
        <button onClick={()=>{console.log(session)}}>Test</button>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
    </>
  );
}

export default GameSession;