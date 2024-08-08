import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  async userLogin(userHandle, username, password) {
    console.log('Step 1: Starting userLogin method');
    check(userHandle, String);
    check(username, String);
    check(password, String);

    try {
      console.log(`Step 2: Searching for user with userHandle: ${userHandle}`);
      const user = await Meteor.users.findOneAsync({ userHandle });
      
      if (!user) {
        console.log('Step 3A: User not found, creating new user');
        return await createNewUser(userHandle, username, password);
      } else {
        console.log('Step 3B: User found, authenticating existing user');
        return await authenticateExistingUser(user, username, password);
      }
    } catch (error) {
      console.error('Error in userLogin method:', error);
      throw new Meteor.Error('login-error', 'Failed to process login');
    }
  }
});

async function createNewUser(userHandle, username, password) {
  console.log('Step 4A: Fetching session cookie for new user');
  const sessionCookie = await fetchSessionCookie(userHandle, username, password);
  if (!sessionCookie) {
    console.log('Step 5A: Failed to get session cookie');
    return { success: false, message: 'Failed to get session cookie' };
  }

  console.log('Step 6A: Inserting new user into database');
  const userId = await Meteor.users.insertAsync({ userHandle, username, password, cookie: sessionCookie });
  console.log(`Step 7A: New user created with ID: ${userId}`);
  return { success: true, message: 'User created and logged in', userId, sessionCookie };
}

async function authenticateExistingUser(user, username, password) {
  console.log('Step 4B: Checking user credentials');
  if (user.username !== username || user.password !== password) {
    console.log('Step 5B: Invalid credentials');
    return { success: false, message: 'Invalid credentials' };
  }
// test this
  console.log('Step 6B: Validating user session');
  const sessionValid = await validateSession(user.userHandle, user.cookie);
  if (!sessionValid) {
    console.log('Step 7B: Session validation failed');
    return { success: false, message: 'Failed to verify session' };
  }
  const sessionCookie =  user.cookie;
  console.log('Step 8B: User authenticated successfully');
  return { success: true, message: 'User logged in successfully', sessionCookie };
}

async function fetchSessionCookie(userHandle, username, password) {
  console.log('Fetching session cookie from API');
  try {
    const cookie = await Meteor.callAsync('fetchApiData', userHandle, username, password);
    if (cookie) {
      console.log('Session cookie fetched :', cookie);
      return cookie;
    } else {
      console.error('No cookie returned from fetchApiData');
      return null;
    }
  } catch (error) {
    console.error('Error fetching session cookie:', error);
    return null;
  }
}

async function validateSession(userHandle, sessionCookie) {
  console.log('Validating session with external service');
  try {
    const response = await fetch(`https://${userHandle}.webchartnow.com/webchart.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `wc_miehr_${userHandle}_session_id=${sessionCookie}`
      }
    });
    const status = response.headers.get('x-lg_status');
    console.log(`Session validation status: ${status}`);
    return status?.toLowerCase() === 'success';
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}