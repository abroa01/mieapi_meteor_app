import React, { useState } from 'react';
import '../../client/main.css';

const HomeComponent = ({ saveUserHandle }) => {
  const [userHandle, setUserHandle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    saveUserHandle(userHandle);
  };

  return (
    <div className="home-container">
      <div className="welcome-message">Welcome</div>
      <form onSubmit={handleSubmit}>
        <h2>Enter User Handle</h2>
        <input
          type="text"
          id="userHandle"
          value={userHandle}
          onChange={(e) => setUserHandle(e.target.value)}
          placeholder="User Handle"
          required
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default HomeComponent;