"use strict";
const kue =  require("kue");
const queue = kue.createQueue();

queue.watchStruckJobs(10000); // removes structjobs proactively. runs for every 10000ms

var logger = require("./log");

kue.app.listen(3000); // kue ui app
kue.app.set("title", "Kue");


queue.process("newRideRequest", function (job, done) {
  logger.info("newsRideRequest task called with id ", job.id);
  var rId = job.data.rId;
  
  
});