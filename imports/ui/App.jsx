import React, { useState } from 'react';
import Login from './Login';
import ApiComponent from '../../client/components/apiComponent.jsx';


const App = () => {
  const [credentials, setCredentials] = useState(null);
  useEffect(() => {
    if (credentials) {
      Meteor.call('loginUser', credentials.username, credentials.password, (error, result) => {
        if (error) {
          console.error('Login failed', error);
        } else {
          console.log('Login successful', result);
        }
      });
    }
  }, [credentials]);

  return (
    <div className="App">
      {credentials ? (
        <div>
          <p>Username: {credentials.username}</p>
          <p>Password: {credentials.password}</p>
          
        </div>
      ) : (
        <Login setCredentials={setCredentials} />
      )}
    </div>
  );
};

export default App;