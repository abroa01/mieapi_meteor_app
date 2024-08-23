import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Logger } from '../imports/utils/logger';
import bcrypt from 'bcrypt';
import 'meteor/accounts-password';

const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

Meteor.methods({
  async userLogin(userHandle, username, password) {
    check(userHandle, String);
    check(username, String);
    check(password, String);

    Logger.info('Starting userLogin method', { userHandle, username });

    try {
      // Await the user lookup to properly handle the returned user object
      const user = await Accounts.findUserByUsername(username);
      
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

async function checkPassword(user, password) {
  console.log(user, password);
  const username = user.username;
  const userHandle = user.profile.userHandle;
  const loginData = new URLSearchParams({ login_user: username, login_passwd: password });
  const response = await fetch(`https://${userHandle}.webchartnow.com/webchart.cgi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: loginData.toString()
    });

    const status = response.headers.get('x-lg_status');
    console.log(status);
    if (status == 'failed') {
      return { failed, message: failed };
      
    } else {
      
    }
    const success = status === 'success';
    Logger.info('Session validation completed', { userHandle, success });
    return { success, message: success ? 'Session validated successfully' : 'Session expired' };
      
}
async function createNewUser(userHandle, username, password) {
  Logger.info('Fetching session cookie for new user', { userHandle, username });
  const sessionCookie = await fetchSessionCookie(userHandle, username, password);
  if (!sessionCookie) {
    Logger.warn('Failed to get session cookie', { userHandle, username });
    return { success: false, message: 'Failed to get session cookie' };
  }

  try {
    console.log(username, password);
    const userId = await Accounts.createUser({
      username: username,
      password: password,
      profile: { userHandle: userHandle }
    });
    console.log(userId);
    console.log(sessionCookie);
    Meteor.users.updateAsync(userId, {
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
  
  try {
    const result = await checkPassword(user, password);
    console.log(result);
    if (result == 'failed') {
      Logger.warn('Invalid credentials', { userId: user._id, username: user.username });
      return { success: false, message: 'Invalid credentials' };
    }
    
  
  } catch (error) {
    Logger.error('Error checking password', { error: error.message, userId: user._id, username: user.username });
    return { success: false, message: 'Authentication error' };
  }


  

  Logger.info('Validating user session', { userId: user._id, username: user.username });
  
  const userHandle = user.profile && user.profile.userHandle;
  const sessionCookie = user.services && user.services.session && user.services.session.cookie;

  if (!userHandle || !sessionCookie) {
    Logger.warn('Missing user handle or session cookie', { userId: user._id, username: user.username });
    return { success: false, message: 'User data incomplete' };
  }

  const sessionValid = await validateSession(userHandle, sessionCookie);
  
  if (!sessionValid.success) {
    Logger.info('Session expired, fetching new session cookie', { userId: user._id, username: user.username });
    const newSessionCookie = await fetchSessionCookie(userHandle, user.username, password);

    if (!newSessionCookie) {
      Logger.warn('Failed to fetch new session cookie', { userId: user._id, username: user.username });
      return { success: false, message: 'Failed to fetch new session cookie' };
    }

    await Meteor.users.updateAsync(user._id, {
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
  return { success: true, message: 'User logged in successfully', sessionCookie: sessionCookie };
}

async function fetchSessionCookie(userHandle, username, password) {
  Logger.info('Fetching session cookie from API', { userHandle, username });
  try {
    const result = await Meteor.callAsync('fetchApiData', userHandle, username, password);
    console.log(result);
    console.log(typeof(result));
    
    if (result) {
      Logger.info('Session cookie fetched successfully', { userHandle, username });
      return result;
    }
    else{
      Logger.warn('No cookie returned from fetchApiData', { userHandle, username });
      return null;
    }
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
