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

    console.log(storedUserHandle, storedCookie);
    
    if (storedUserHandle && storedCookie) {
      setUserHandle(storedUserHandle);
      setCookie(storedCookie);
      setCurrentPage('api');
    }
  }, []);

  const handleSaveUserHandle = (newUserHandle) => {
    setUserHandle(newUserHandle);
    Session.set('userHandle', newUserHandle); // Do we need to save the session using userHandle ?
    setCurrentPage('login');
  };

  const handleLogin = (newCookie) => {
    setCookie(newCookie);
    Session.set('userCookie', newCookie); // need to check this ?
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
          setCredentials={setCredentials} // do we need this ??
          onLogin={handleLogin}
          userHandle={userHandle}
        />;
      case 'api':
        return <ApiComponent 
          credentials={credentials} // do we need this ??
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