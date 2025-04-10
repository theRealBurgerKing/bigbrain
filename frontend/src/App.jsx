import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  Outlet,
} from 'react-router-dom';




const Home = () => {
  return <div>Home</div>;
};

const About = () => {
  return <div>
    About
    <Outlet />
  </div>;
};

const AboutTeam = () => {
  return <div>AboutTeam</div>;
};

const AboutHistory = () => {
  return <div>AboutHistory</div>;
};

const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = React.useState('');

  if (!params.name) {
    return (
      <>
        Name: <input value={name} onChange={e => setName(e.target.value)} />
        <button onClick={() => {
          navigate('/profile/' + name);
        }}>Go!</button>
      </>
    );
  }
  return (
    <div>
      Profile {params.name}
    </div>
  );
};

const Nav = () => {
  return (
    <>
      <span><Link to="/">Home</Link></span>&nbsp;|&nbsp;
      <span><Link to="/about">About</Link></span>&nbsp;|&nbsp;
      <span><Link to="/about/team">Team</Link></span>&nbsp;|&nbsp;
      <span><Link to="/about/history">History</Link></span>&nbsp;|&nbsp;
      <span><Link to="/profile">Profile</Link></span>
    </>
  );
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Nav />
        <hr />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />}>
            <Route path="team" element={<AboutTeam />} />
            <Route path="history" element={<AboutHistory />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:name" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;