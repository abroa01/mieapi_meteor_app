import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import '../../client/main.css';

const ApiComponent = ({ credentials, cookie, userHandle, onLogout }) => {
  const [apiResponse, setApiResponse] = useState(null);
  const [apiResponseGet, setApiResponseGet] = useState(null);
  const [apiName, setApiName] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getApi = async () => {
    if (!apiName) {
      setError('API name is required');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {      
      const result = await new Promise((resolve, reject) => {
        Meteor.call('getApiData', apiName, cookie, userHandle, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      setApiResponseGet(result);
    } catch (error) {
      setError(`Error getting API: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const putApi = async () => {
    if (!apiName || !jsonInput) {
      setError('API name and JSON input are required');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const jsonData = JSON.parse(jsonInput);
      const result = await new Promise((resolve, reject) => {
        Meteor.call('putApiData', apiName, jsonData, cookie, userHandle, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      setApiResponse(result);
    } catch (error) {
      setError(`Error putting API: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="api-container">
      <button onClick={onLogout}>Logout</button>
      <div>
        <label htmlFor="apiName">API Name:</label>
        <input
          type="text"
          id="apiName"
          value={apiName}
          onChange={(e) => setApiName(e.target.value)}
        />
      </div>
      <button onClick={getApi} disabled={isLoading}>Get Api</button>
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
      <button onClick={putApi} disabled={isLoading}>Put Api</button>
      {apiResponse && (
        <div>
          <h2>API Response (Put Api):</h2>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ApiComponent;