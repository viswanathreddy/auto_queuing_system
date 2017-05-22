"use strict";
const kue =  require("kue");
const queue = kue.createQueue();

queue.watchStuckJobs(10000); // removes structjobs proactively. runs for every 10000ms

var logger = require("./log");
const constants = require("./constants");
var db = require('./db');

var mongoose = require("mongoose");
require("./models/rideRequest");
var rideRequest = mongoose.model("RideRequest");

var CronJob = require('cron').CronJob;
kue.app.listen(3010); //kue ui app
kue.app.set("title", "Kue");


queue.process("newRideRequest", function (job, done) {
  logger.info("newsRideRequest task called with id ", job.id);
  var rId = job.data.rId;
  done();
});

/* cron job runs for every 5 sec and update the status of ongoing requests to complete after 5 mints */
new CronJob('*/5 * * * * * ', function () {
  var job = queue.create("updateRideRequestStatus", {}).attempts(3);
  job.save();
}, function () {
  logger.info("Job updateRideRequestStatus completed");
},
  true, 'Asia/Kolkata');

queue.process("updateRideRequestStatus",  function (job, done) {
  console.log("update ride request status task called ");
  rideRequest.find({status: constants.ONGOING}, function (err, docs) {
    console.log("in update ride req", err, docs);
    if (err) {
      return logger.error(err);
    }
    var docsCnt = 0;
    if (docs.length == 0)
      return done();
    docs.forEach(function (doc) {
      var ridePickupTime = doc.pickupTime;
      var nowTime = Date.now();
      var fiveMints = 5*60*1000;
      if (nowTime - ridePickupTime >= fiveMints) {
        doc.status = constants.COMPLETED;
        doc.requestCompleteTime = Date.now();
        doc.save(function (err, savedDoc) {
          if (err) {
            logger.error(err);
            done(err);
          }
          docsCnt += 1;
          console.log('processing doc ', docsCnt);
          if (docsCnt == docs.length) {
            console.log('done all docs');
            done();
          }
        })
      }
    })
  })
})