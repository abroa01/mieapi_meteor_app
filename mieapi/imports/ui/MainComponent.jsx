import React, { useState, useEffect } from 'react';
import { Session } from 'meteor/session';
import ApiComponent from '../../client/components/apiComponent.jsx';
import LoginComponent from './Login.jsx';
import HomeComponent from "../../client/components/home.jsx";

const MainComponent = () => {
  const [credentials, setCredentials] = useState(null);
  const [cookie, setCookie] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const storedUserHandle = Session.get('userHandle');
    const storedCookie = Session.get('userCookie');
    
    if (storedUserHandle && storedCookie) {
      setUserHandle(storedUserHandle);
      setCookie(storedCookie);
      setCurrentPage('api');
    }
  }, []);

  const handleSaveUserHandle = (newUserHandle) => {
    setUserHandle(newUserHandle);
    Session.set('userHandle', newUserHandle);
    setCurrentPage('login');
  };

  const handleLogin = (newCookie) => {
    setCookie(newCookie);
    Session.set('userCookie', newCookie);
    setCurrentPage('api');
  };

  const handleLogout = () => {
    setCookie('');
    setUserHandle('');
    Session.clear();
    localStorage.clear();
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomeComponent saveUserHandle={handleSaveUserHandle} />;
      case 'login':
        return <LoginComponent
          setCredentials={setCredentials}
          onLogin={handleLogin}
          userHandle={userHandle}
        />;
      case 'api':
        return <ApiComponent 
          credentials={credentials}
          cookie={cookie}
          userHandle={userHandle}
          onLogout={handleLogout}
        />;
      default:
        return <HomeComponent saveUserHandle={handleSaveUserHandle} />;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
};

export default MainComponent;