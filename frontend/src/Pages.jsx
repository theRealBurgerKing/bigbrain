import { useState,useEffect } from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Register from './Register1';
import Login from './Login';
import Dashboard from './Dashboard';

function Pages() {
  const [token,setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  },[]);

  const successJob = (token)=>{
    localStorage.setItem('token',token);
      setToken(token);
      navigate('/dashboard');
  }
  const logout = async () => {
    try{
      const response = await axios.post('http://localhost:5005/admin/auth/logout',{},{
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      localStorage.removeItem('token');
      setToken(null);
      navigate('/login');
    } catch (err) {
      alert(err.response.data.error);
    };
  }
  return (
    <>
      {token ? (
        <>
          <button onClick = {logout}>Logout</button>
        </>
      ):(
        <>
          <Link to = "/register">Register</Link>|
          <Link to = "/Login">Login</Link>
        </>
      )}
      
      <hr/>
      <Routes>
        <Route path="/register" element={<Register successJob = {successJob}/>} />
        <Route path="/login" element={<Login successJob = {successJob}/>} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default Pages;