import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import './styles/apiComponent.css';
import apiNames from 'mieapi'
import { Session } from 'meteor/session';

const ApiComponent = ({ setCredentials, cookie, userHandle }) => {
  const [apiResponse, setApiResponse] = useState(null);
  const [apiResponseGet, setApiResponseGet] = useState(null);
  const [apiName, setApiName] = useState('');
  const [jsonInput, setJsonInput] = useState(''); // State to hold JSON input

  //console.log('I am inside ApiComponent');
  console.log(cookie);


  // Function to handle the 'Get Api' button click
  const getApi = async () => {
    try {
      if (!apiName) {
        console.error('API name is required');
        return;
      }

      
      const result = await new Promise((resolve, reject) => {
        console.log(userHandle);
        Meteor.call('getApiData', apiName, cookie, userHandle, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      console.log(result);
      setApiResponseGet(result); // Update state with the API response
    } catch (error) {
      console.error('Error getting API:', error);
    }
  };

  // Function to handle the 'Put Api' button click
  const putApi = async () => {
    try {
      if (!apiName || !jsonInput) {
        console.error('API name and JSON input are required');
        return;
      }

      const jsonData = JSON.parse(jsonInput); // Parse the JSON input

      // Call the Meteor method that returns a promise
      const result = await new Promise((resolve, reject) => {
        Meteor.call('putApiData', apiName, jsonData, cookie, userHandle, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      console.log(result);
      setApiResponse(result); // Update state with the API response
    } catch (error) {
      console.error('Error putting API:', error);
    }
  };

  return (
    <div className="api-container">
      <div>
        <label htmlFor="apiName">API Name:</label>
        <input
          type="text"
          id="apiName"
          value={apiName}
          onChange={(e) => setApiName(e.target.value)}
        />
      </div>

      <button onClick={getApi}>Get Api</button>
      {apiResponseGet && (
        <div>
          <h2>API Response (Get Api):</h2>
          <pre>{JSON.stringify(apiResponseGet, null, 2)}</pre>
        </div>
      )}

      <div>
        <label htmlFor="jsonInput">JSON Input:</label>
        <textarea
          id="jsonInput"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows="10"
          cols="50"
        />
      </div>

      <button onClick={putApi}>Put Api</button>
      {apiResponse && (
        <div>
          <h2>API Response (Put Api):</h2>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiComponent;
