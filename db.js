var mongoose = require('mongoose');
var logger = require('./log');

// Build the connection string
var dbURI = 'mongodb://localhost/autoQueuedb';

mongoose.connect(dbURI, function () {
  logger.debug('Mongoose default connection open to ' + dbURI);
});

mongoose.connection.on('connecting', function () {
  logger.debug('Connecting to MongoDB...');
});
mongoose.connection.on('connected', function () {
    console.info('MongoDB connected!');
});

mongoose.connection.on('open', function () {
    logger.debug('MongoDB connection opened!');
});
// If the connection throws an error
mongoose.connection.on('error',function (err) {
  logger.error('Mongoose default connection error: ' + err.stack);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  logger.error('Mongoose default connection disconnected');
  //reconnecting mongoose
  mongoose.connect(dbURI);
});

mongoose.connection.on('reconnected', function () {
  logger.info('MongoDB reconnected!');
});

mongoose.connection.on('close', function () {
  logger.info('MongoDB closed');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    logger.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

//TODO include all models here for initialisation
require("./models/counter");
require("./models/customer");
require("./models/driver");
require("./models/rideRequest");