import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login(props){
  const successJob = props.successJob;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  const login = async() => {
    try{
      const response = await axios.post('http://localhost:5005/admin/auth/login',{
        email: email,
        password: password,
      });
      const token = response.data.token;
      successJob(token);
    } catch(err) {
      alert('err',err.response.data.error);
    }
  };

  return (
    <>
      <h1>Login</h1>
      Email: <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" /><br />
      Password: <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" /><br />
      <button onClick={login}>Login</button>
    </>
  );
}

export default Login;
