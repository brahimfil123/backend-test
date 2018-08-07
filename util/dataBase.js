const fs = require('fs');
const path = require('path');
const autoIncrement = require('mongoose-auto-increment');
require('bluebird');

module.exports = (mongoose, dbURI, DEBUG) => {
  mongoose.Promise = Promise;

// Create the database connection
  mongoose.connect(dbURI);

  autoIncrement.initialize(mongoose.connection);

// CONNECTION EVENTS
// When successfully connected
  mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open to ' + dbURI);
  });

// If the connection throws an error
  mongoose.connection.on('error', err => {
    console.error('Failed to connect to database ...');
    if(DEBUG) {
      process.exit(1);
    }
  });

// When the connection is disconnected
  mongoose.connection.on('disconnected', err => {
    console.error('Mongoose default connection disconnected');
    if(DEBUG) {
      process.exit(1);
    }
  });

// If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(function() {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });

// requiring all models

  const files = fs.readdirSync(__dirname);
  files.forEach(file => {
    if(file != 'index.js') {
      require(path.join(__dirname, file));
    }
  });
};