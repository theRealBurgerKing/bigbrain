import { useState } from 'react';
import axios from 'axios';

function Register({ successJob, showError }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verify that the password matches when onblur
  const handleConfirmPasswordBlur = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    //performed only if neither field is empty
    if (password && newConfirmPassword && password !== newConfirmPassword) {
      showError('Passwords do not match.');
    }
  };


  const register = async () => {
    // Check whether the value is null
    if (!email || !username || !password || !confirmPassword) {
      showError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
      }
    // DON'T DELETE IT, JUST FOR TESTING CONVENIENCE

    // //check the email
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   showError('Please enter a valid email address.');
    //   return;
    // }


    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5005/admin/auth/register', {
        email: email,
        username: username,
        password: password,
      });
      const token = response.data.token;
      if (!token) {
        showError('Registration successful, but no token received.');
        return;
      }
      localStorage.setItem('myemail', email);
      successJob(token);
    } catch (err) {
      if (err.response) {
        showError(err.response.data?.error || 'Unknown error during registration.');
      } else if (err.request) {
        showError('No response from server. Please check if the server is running.');
      } else {
        showError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); //Prevent form submission behavior by default
      register(); //try to submit
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <div>
        Email: <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          // DON'T DELETE IT, JUST FOR TESTING CONVENIENCE
          //type="email"
        /><br />
      </div>

      <div>
        Username: <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
        /><br />
      </div>

      <div>
        Password: <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          type="password"
        /><br />
      </div>

      <div>
        Confirm Password: <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={handleConfirmPasswordBlur}
          onKeyDown={handleKeyDown}
          type="password"
        /><br />
      </div>

      <button
        type="submit"
        onClick={register}
        disabled={isLoading}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </div>
  );
}

export default Register;