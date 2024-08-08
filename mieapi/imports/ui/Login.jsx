import React, { useState } from 'react';
import css from '../../client/main.css'
import ApiComponent from '../../client/components/apiComponent'
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

Meteor.subscribe('users');


const Login = ({ setShowApiComponent, setCredentials, setCookie, userHandle }) => {
    const [username, setUsernameState] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const onButtonClick = async () => {
        // Set initial error values to empty
        setUsernameError('')
        setPasswordError('')

        // Check if the user has entered both fields correctly
        if ('' === username) {
            setUsernameError('Please enter your username')
            return
        }

        if ('' === password) {
            setPasswordError('Please enter a password')
            return
        }
        setCredentials({ username, password });
        //console.log(username, password);
        //const loginPageUrl = 'https://anshulmie.webchartnow.com/webchart.cgi/json';
        try {
            const result = await Meteor.callAsync('userLogin', userHandle, username, password);
            console.log('Result in Login is:', result);  // Use comma instead of template literal
          
            if (result && typeof result === 'object') {
              // Store the whole result object in the session
              const updateCookie = () => {
                Session.set(userHandle, result.sessionCookie);
              };
          
              const computation = Tracker.autorun(updateCookie);
          
              console.log('Session value:', Session.get(userHandle));
          
              if (result.success) {
                // Assuming setCookie expects a string, pass the cookie value if it exists
                if (result.sessionCookie) {
                  setCookie(result.sessionCookie);
                } else {
                  console.warn('No cookie found in the result');
                }
                setShowApiComponent(true);
              } else {
                alert(result.message || 'Invalid Credentials');
                setShowApiComponent(false);
              }
            } else {
              console.error('Unexpected result format:', result);
              alert('An error occurred during login');
              setShowApiComponent(false);
            }
          } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login');
            setShowApiComponent(false);
          }}
        

    return (
        <div className="mainContainer">
            <div className="titleContainer">
                <div>Login</div>
            </div>
            <br />
            <div className="inputContainer">
                <input
                    value={username}
                    placeholder="Enter your username here"
                    onChange={(ev) => setUsernameState(ev.target.value)}
                    className="inputBox"
                />
                <label className="errorLabel">{usernameError}</label>
            </div>
            <br />
            <div className="inputContainer">
                <input
                    value={password}
                    placeholder="Enter your password here"
                    onChange={(ev) => setPassword(ev.target.value)}
                    className="inputBox"
                    type='password'
                />
                <label className="errorLabel">{passwordError}</label>
            </div>
            <br />
            <div className="inputContainer">
                <input className="inputButton" type="button" onClick={onButtonClick} value="Log in" />
            </div>
        </div>
    );
};

export default Login;
