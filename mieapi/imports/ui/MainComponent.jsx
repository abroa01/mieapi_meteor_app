import React, { useState, useEffect } from 'react';
import ApiComponent from '../../client/components/apiComponent.jsx';
import LoginComponent from './Login'
import HomeComponent from "../../client/components/home.jsx";
import {Session} from 'meteor/session'


const MainComponent = () => {
    const [credentials, setCredentials] = useState(null);
    const [showApiComponent, setShowApiComponent] = useState(false);
    const [cookie, setCookie ] = useState('');
    const [userHandle, setUserHandle]  = useState(false);

    console.log(credentials, showApiComponent, userHandle)
    //const loginPageUrl = `https://${userHandle}.webchartnow.com/webchart.cgi/json`;

    useEffect(()=>{

        //const storedCookie = localStorage.getItem("cookie");
        setCookie(Session.get('userHandle'));
        const storedUserHandle = Session.get('userHandle');
        setUserHandle(storedUserHandle);

    }, [])
    const handleSaveUserHandle = (userHandle) => {
        setUserHandle(userHandle);
        if (!cookie) {
            //localStorage.setItem("userHandle", userHandle);\
            Session.get(`${userHandle}`);
        }
    };

    return (
        <div>
            {userHandle ? (
                cookie ? (
                    <ApiComponent credentials={credentials} cookie={cookie} userHandle={userHandle} />
                ) : (
                    <LoginComponent 
                        setShowApiComponent={setShowApiComponent} 
                        setCredentials={setCredentials} 
                        setCookie={setCookie}
                        userHandle = {userHandle} 
                    />
                )
            ) : (
                <HomeComponent saveUserHandle={handleSaveUserHandle} />
            )}
        </div>
    );
};

export default MainComponent;
