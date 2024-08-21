import { Meteor } from 'meteor/meteor';

class Logger {
  static info(message, meta = {}) {
    console.log(`INFO: ${message}`, JSON.stringify(meta));
    Meteor.call('logToDatabase', 'info', message, meta);
  }

  static warn(message, meta = {}) {
    console.warn(`WARN: ${message}`, JSON.stringify(meta));
    Meteor.call('logToDatabase', 'warn', message, meta);
  }

  static error(message, meta = {}) {
    console.error(`ERROR: ${message}`, JSON.stringify(meta));
    Meteor.call('logToDatabase', 'error', message, meta);
  }
}

export { Logger };

// Server-side method to log to database
if (Meteor.isServer) {
  Meteor.methods({
    logToDatabase(level, message, meta) {
      // You can implement database logging here if needed
      // For now, we'll just log to console on the server
      console.log(`${level.toUpperCase()} [Server]: ${message}`, JSON.stringify(meta));
    }
  });
}