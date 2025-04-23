import React from 'react';
import { useNavigate } from 'react-router-dom';

function Index({ token }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login');
    }
  }, []);
}

export default Index;