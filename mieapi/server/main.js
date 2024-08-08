import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';
import api from 'mieapi';
import { check } from 'meteor/check';
import { Session } from 'meteor/session';
import './auth.js'

const { apiService } = api;

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.methods({
  async fetchApiData(userHandle, username, password) {
    console.log('fetchApiData called with:', { userHandle, username });
    try {
      console.log('Calling apiService.initializeSession...');
      const result = await apiService.initializeSession(userHandle, username, password);
      console.log('Result from initializeSession:', result);

      if (result && result.success) {
        console.log('Successful result:', result.cookie);
        return result.cookie;
      } else {
        console.error('API error:', result ? result.message : 'No result from initializeSession');
        throw new Meteor.Error('api-error', result ? result.message : 'No result from initializeSession');
      }
    } catch (error) {
      console.error('Error in fetchApiData:', error);
      throw new Meteor.Error('api-error', 'Error fetching API data: ' + error.message);
    }
  }
});

Meteor.methods({
  getApiData(apiName, cookie, userHandle) {
      check(apiName, String); 
      check(cookie, String); 
      check(userHandle, String); 
      //console.log(userHandle);
      //const sessionCookie = Session.get(userHandle);

      return new Promise((resolve, reject) => {
          apiService.getApi(cookie, apiName, {}, userHandle, (error, result) => {
              if (error) {
                  reject(new Meteor.Error('get-api-error', 'Error fetching Get API data'));
              } else {
                  resolve(result);
              }
          });
      });
  }
});
Meteor.methods({
  putApiData(apiName, jsonData, cookie, userHandle) {
      check(apiName, String);  // Validate apiName to ensure it's a string

      return new Promise((resolve, reject) => {
          apiService.putApi(cookie, apiName, jsonData, userHandle, (error, result) => {
              if (error) {
                  reject(new Meteor.Error('get-api-error', 'Error fetching Get API data'));
              } else {
                  resolve(result);
              }
          });
      });
  }
});


Meteor.startup(async () => {
  // If the Links collection is empty, add some data.
  if (await LinksCollection.find().countAsync() === 0) {
    await insertLink({
      title: 'Do the Tutorial',
      url: 'https://www.meteor.com/tutorials/react/creating-an-app',
    });

    await insertLink({
      title: 'Follow the Guide',
      url: 'https://guide.meteor.com',
    });

    await insertLink({
      title: 'Read the Docs',
      url: 'https://docs.meteor.com',
    });

    await insertLink({
      title: 'Discussions',
      url: 'https://forums.meteor.com',
    });
  }

  // We publish the entire Links collection to all clients.
  // In order to be fetched in real-time to the clients
  Meteor.publish("links", function () {
    return LinksCollection.find();
  });
  Meteor.publish('users', function() {
    return Meteor.users.find();
  });
});
