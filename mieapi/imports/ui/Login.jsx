import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import '../../client/main.css';

const Login = ({ onLogin, userHandle }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onButtonClick = async () => {
    setUsernameError('');
    setPasswordError('');

    if (username === '') {
      setUsernameError('Please enter your username');
      return;
    }
    if (password === '') {
      setPasswordError('Please enter a password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await Meteor.callAsync('userLogin', userHandle, username, password);
      console.log('Result in Login is:', result);
      if (result.success) {
          Session.set(`${userHandle}_session`, result);
          console.log(Session.get(`${userHandle}_session`));
          
          onLogin(result);
        } else {
          alert(result.message || 'Invalid Credentials');
        }
      } 
      catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mainContainer">
      <div className="titleContainer">Login</div>
      <div className="inputContainer">
        <input
          value={username}
          placeholder="Enter your username here"
          onChange={(ev) => setUsername(ev.target.value)}
          className="inputBox"
        />
        <label className="errorLabel">{usernameError}</label>
        <input
          value={password}
          placeholder="Enter your password here"
          onChange={(ev) => setPassword(ev.target.value)}
          className="inputBox"
          type='password'
        />
        <label className="errorLabel">{passwordError}</label>
        <button
          onClick={onButtonClick}
          disabled={isLoading}
        >
          <div className="button-content">
            {isLoading && <div className="spinner"></div>}
            <span className="button-text">{isLoading ? "Logging in..." : "Log in"}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Login;