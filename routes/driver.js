"use strict";

var monogoose = require("mongoose");
require("rideRequest");
var router = require("express").Router();
var logger = require("../log");

var rideRequest = monogoose.model("RideRequest");
const constants = require("../constants");

router.post('/refresh', function (req, res) {
  var driverId = req.body.driverId;
  rideRequest.aggregate([ { $match: { $or: [ { driver: driverId }, { driver: "" } ] } },
    { $group: { _id: status } } ], function (err, result) {
    if (err) {
      logger.error(err);
      return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
    }
    console.log("ride request response ", result);
    return res.json(result);
  })
});

router.post('/rideSelect', function (req, res) {
  var rideRequestId = req.body.rideRequestId;
  var driver = req.body.driverId;
  rideRequest.find({rId: rideRequestId}, function (err, doc) {
    if (err) {
      logger.error(err);
      return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
    }
    if (doc.status != constants.WAITING && doc.driver != driver) {
      res.statusCode = 210;
      return res.json({message: "request no longer available"});
    }
    if (doc.driver == driver) {
      res.statusCode = 211;
      return res.json({message: "ride already selected by you", rideStatus: doc.status});
    }
    // critical code for parallel processing if any later
    doc.driver = driver;
    doc.status = constants.ONGOING;
    doc.pickupTime = Date.now();
    doc.save(function (err, savedDoc) {
      if (err) {
        logger.error(err);
        return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
      }
      return res.json({message: "ride selected sucessfully", rideStatus: constants.ONGOING})
    })
  })
});

router.post('/rideComplete', function (req, res) {
  var rideRequestId = req.body.rideRequestId;
  var driver = req.body.driverId;
  rideRequest.find({rId: rideRequestId, driver: driver}, function (err, doc) {
    if (err) {
      logger.error(err);
      return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
    }
    if (doc.status == constants.COMPLETED) {
      return res.json({message: "ride completed already"});
    }
    doc.status = constants.COMPLETED;
    doc.requestCompleteTime = Date.now();
    doc.save(function (err, savedDoc) {
      if (err) {
        logger.error(err);
        return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
      }
      return res.json({message: 'ride completed'})
    })
  })
});

module.exports = router;