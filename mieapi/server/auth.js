// import { Meteor } from 'meteor/meteor';
// import { check } from 'meteor/check';

// Meteor.methods({
//   async userLogin(userHandle, username, password) {
//     console.log('Step 1: Starting userLogin method');
//     check(userHandle, String);
//     check(username, String);
//     check(password, String);

//     try {
//       console.log(`Step 2: Searching for user with userHandle: ${userHandle}`);
//       const user = await Meteor.users.findOneAsync({ userHandle });
      
//       if (!user) {
//         console.log('Step 3A: User not found, creating new user');
//         return await createNewUser(userHandle, username, password);
//       } else {
//         console.log('Step 3B: User found, authenticating existing user');
//         return await authenticateExistingUser(user, username, password);
//       }
//     } catch (error) {
//       console.error('Error in userLogin method:', error);
//       throw new Meteor.Error('login-error', 'Failed to process login');
//     }
//   }
// });

// async function createNewUser(userHandle, username, password) {
//   console.log('Step 4A: Fetching session cookie for new user');
//   const sessionCookie = await fetchSessionCookie(userHandle, username, password);
//   if (!sessionCookie) {
//     console.log('Step 5A: Failed to get session cookie');
//     return { success: false, message: 'Failed to get session cookie' };
//   }

//   console.log('Step 6A: Inserting new user into database');
//   const userId = await Meteor.users.insertAsync({ userHandle, username, cookie: sessionCookie });
//   console.log(`Step 7A: New user created with ID: ${userId}`);
//   return { success: true, message: 'User created and logged in', userId, sessionCookie };
// }

// async function authenticateExistingUser(user, username, password) {
//   console.log('Step 4B: Checking user credentials');
//   if (user.username !== username || user.password !== password) {
//     console.log('Step 5B: Invalid credentials');
//     return { success: false, message: 'Invalid credentials' };
//   }
// // test this
//   console.log('Step 6B: Validating user session');
//   const sessionValid = await validateSession(user.userHandle, user.cookie);
//   const sessionCookie =  user.cookie;
//   console.log(`Session Validity - ${JSON.stringify(sessionValid)}`);
//   console.log(sessionValid.success);
//   if (sessionValid.success == false) {
//     console.log('Step 7B: Session validation failed');
//     console.log('Step 7C: Old Session Cookie got expired, Fetching new session cookie');
//     const sessionCookie = await fetchSessionCookie(user.userHandle, username, password);

//     if (!sessionCookie) {
//       return { success: false, message: 'Failed to fetch new session cookie' };

      
//     } else {
//       //const sessionCookie =  user.cookie;
//       Meteor.users.updateAsync({ userHandle: user.userHandle }, { $set: { cookie: sessionCookie}});
//       console.log('Step 8B: User authenticated successfully');
//       return { success: true, message: 'User logged in successfully', sessionCookie };     
//     }
  
//   } else {
//     return { success: true, message: 'Session validation Success',  sessionCookie};     
//   }

// }

// async function fetchSessionCookie(userHandle, username, password) {
//   console.log('Fetching session cookie from API');
//   try {
//     const cookie = await Meteor.callAsync('fetchApiData', userHandle, username, password);
//     if (cookie) {
//       console.log('Session cookie fetched :', cookie);
//       return cookie;
//     } else {
//       console.error('No cookie returned from fetchApiData');
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching session cookie:', error);
//     return null;
//   }
// }

// async function validateSession(userHandle, sessionCookie) {
//   console.log('Validating session with external service');
//   try {
//     const response = await fetch(`https://${userHandle}.webchartnow.com/webchart.cgi`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Cookie': `wc_miehr_${userHandle}_session_id=${sessionCookie}`
//       }
//     });
//     console.log(`Resposne from the external service is : ${JSON.stringify(response)}`)
//     const status = response.headers.get('x-lg_status');
//     if (status == 'success') {
//       console.log(`Session validation status: ${status}`);
//       return { success: true, message: 'Session Validated successfully' };      
      
//     } else {
      
//       return { success: false, message: 'Session Expired' };
//     }

//   } catch (error) {
//     console.error('Error validating session:', error);
//     return { success: false, message: 'Session Validation failed' };
//   }
// }

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Logger } from '../imports/utils/logger';

const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

Meteor.methods({
  async userLogin(userHandle, username, password) {
    check(userHandle, String);
    check(username, String);
    check(password, String);

    Logger.info('Starting userLogin method', { userHandle, username });

    try {
      const user = Accounts.findUserByUsername(userHandle).then(user => {
        console.log(user);
      }).catch(error => {
        console.error("Error finding user:", error);
      });
      
      
      if (!user) {
        Logger.info('User not found, creating new user', { userHandle, username });
        return await createNewUser(userHandle, username, password);
      } else {
        Logger.info('User found, authenticating existing user', { userHandle, username });
        return await authenticateExistingUser(user, password);
      }
    } catch (error) {
      Logger.error('Error in userLogin method', { error: error.message, stack: error.stack });
      throw new Meteor.Error('login-error', 'Failed to process login');
    }
  }
});

async function createNewUser(userHandle, username, password) {
  Logger.info('Fetching session cookie for new user', { userHandle, username });
  const sessionCookie = await fetchSessionCookie(userHandle, username, password);
  if (!sessionCookie) {
    Logger.warn('Failed to get session cookie', { userHandle, username });
    return { success: false, message: 'Failed to get session cookie' };
  }

  try {
    const userId = Accounts.createUser({
      username: username,
      password: password,
      profile: { userHandle: userHandle }
    });

    Meteor.users.update(userId, {
      $set: {
        'services.session': {
          cookie: sessionCookie,
          expiresAt: new Date(Date.now() + SESSION_EXPIRY)
        }
      }
    });

    Logger.info('New user created', { userId, userHandle, username });
    return { success: true, message: 'User created and logged in', userId, sessionCookie };
  } catch (error) {
    Logger.error('Error creating new user', { error: error.message, stack: error.stack });
    return { success: false, message: 'Failed to create user' };
  }
}

async function authenticateExistingUser(user, password) {
  Logger.info('Authenticating user', { userId: user._id, username: user.username });
  
  const result = Accounts._checkPassword(user, password);
  if (result.error) {
    Logger.warn('Invalid credentials', { userId: user._id, username: user.username });
    return { success: false, message: 'Invalid credentials' };
  }

  Logger.info('Validating user session', { userId: user._id, username: user.username });
  const sessionValid = await validateSession(user.profile.userHandle, user.services.session.cookie);
  
  if (!sessionValid.success) {
    Logger.info('Session expired, fetching new session cookie', { userId: user._id, username: user.username });
    const newSessionCookie = await fetchSessionCookie(user.profile.userHandle, user.username, password);

    if (!newSessionCookie) {
      Logger.warn('Failed to fetch new session cookie', { userId: user._id, username: user.username });
      return { success: false, message: 'Failed to fetch new session cookie' };
    }

    Meteor.users.update(user._id, {
      $set: {
        'services.session': {
          cookie: newSessionCookie,
          expiresAt: new Date(Date.now() + SESSION_EXPIRY)
        }
      }
    });

    Logger.info('User authenticated with new session', { userId: user._id, username: user.username });
    return { success: true, message: 'User logged in successfully', sessionCookie: newSessionCookie };
  }

  Logger.info('User authenticated successfully', { userId: user._id, username: user.username });
  return { success: true, message: 'User logged in successfully', sessionCookie: user.services.session.cookie };
}

async function fetchSessionCookie(userHandle, username, password) {
  Logger.info('Fetching session cookie from API', { userHandle, username });
  try {
    const result = await Meteor.callAsync('fetchApiData', userHandle, username, password);
    if (result && result.cookie) {
      Logger.info('Session cookie fetched successfully', { userHandle, username });
      return result.cookie;
    }
    Logger.warn('No cookie returned from fetchApiData', { userHandle, username });
    return null;
  } catch (error) {
    Logger.error('Error fetching session cookie', { error: error.message, stack: error.stack, userHandle, username });
    return null;
  }
}

async function validateSession(userHandle, sessionCookie) {
  Logger.info('Validating session with external service', { userHandle });
  try {
    const response = await fetch(`https://${userHandle}.webchartnow.com/webchart.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `wc_miehr_${userHandle}_session_id=${sessionCookie}`
      }
    });

    const status = response.headers.get('x-lg_status');
    const success = status === 'success';
    Logger.info('Session validation completed', { userHandle, success });
    return { success, message: success ? 'Session validated successfully' : 'Session expired' };
  } catch (error) {
    Logger.error('Error validating session', { error: error.message, stack: error.stack, userHandle });
    return { success: false, message: 'Session validation failed' };
  }
}