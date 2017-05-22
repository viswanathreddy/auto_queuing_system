"use strict";

var mongoose = require("mongoose");
require("../models/rideRequest");
var router = require("express").Router();
var logger = require("../log");

var rideRequest = mongoose.model("RideRequest");
const constants = require("../constants");


function calcTimeElapsed(req, res) {
  console.log("in calc time elapsed");
  var docs = req.reqRideItems;
  docs.forEach(function (doc) {
      var elapsedSec, elapsedMin, pickupElapsedSec, pickupElapsedMin, completeElapsedSec, completeElapsedMin;

      elapsedSec = (Date.now() - doc.requestTime)/1000;

      if (doc.status == constants.ONGOING || doc.status == constants.COMPLETED)
        pickupElapsedSec = (Date.now() - doc.pickupTime)/1000;
      if (doc.status == constants.COMPLETED)
        completeElapsedSec = (doc.requestCompleteTime - doc.pickupTime)/1000;

      if (elapsedSec > 60) {
        elapsedMin = Math.floor(elapsedSec/60);
        elapsedSec = elapsedSec - (elapsedMin*60);
      }
      if (pickupElapsedSec > 60) {
        pickupElapsedMin = Math.floor(pickupElapsedSec/60);
        pickupElapsedSec = pickupElapsedSec - (pickupElapsedMin*60);
      }
      if (completeElapsedSec > 60) {
        completeElapsedMin = Math.floor(completeElapsedSec/60);
        completeElapsedSec = completeElapsedSec - (completeElapsedMin*60);
      }
      doc.elapsedMin = elapsedMin;
      doc.elapsedSec = Number(elapsedSec).toFixed(2);
      doc.pickupElapsedMin = pickupElapsedMin;
      doc.pickupElapsedSec = Number(pickupElapsedSec).toFixed(2);
      doc.completeElapsedMin = completeElapsedMin;
      doc.completeElapsedSec = Number(completeElapsedSec).toFixed(2);
  });
  return res.render('driverapp', {items: docs, driverId: req.driver});
}

router.get('/', function (req, res) {
  console.log('driver app html');
  var driverId = req.query.id;
  rideRequest.find( { $or: [ { driver: driverId }, { driver: "" } ] } , function (err, result) {
    if (err) {
      logger.error(err);
      return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
    }
    console.log("ride request response ", result);
    req.reqRideItems = result;
    req.driver = driverId;
    calcTimeElapsed(req, res);
  })
});

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

function hasOngoingRide(req, res, next) {
  var driver = req.body.driverId;
  rideRequest.find({driver: driver, status: constants.ONGOING}, function (err, docs) {
    if (err) {
      logger.error(err);
      return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
    }
    if (docs.length > 0) {
      req.ongoingRides = true;
    }
    else 
      req.ongoingRides = false;
    next();
  })
}

router.post('/rideSelect', hasOngoingRide, function (req, res) {
  if (req.ongoingRides) {
    return res.json({message: "cannot have multiple rides simultaneously",  statusCode: 209});
  }
  var rideRequestId = req.body.rideRequestId;
  var driver = req.body.driverId;
  console.log('ride select ', rideRequestId, driver);
  rideRequest.findOne({rId: rideRequestId}, function (err, doc) {
    if (err) {
      logger.error(err);
      return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
    }
    if (doc.status != constants.WAITING && doc.driver != driver) {
      return res.json({message: "request no longer available", statusCode: 210});
    }
    if (doc.driver == driver) {
      res.statusCode = 211;
      return res.json({message: "ride already selected by you", rideStatus: doc.status, statusCode: 211});
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
      return res.json({message: "success", rideStatus: constants.ONGOING, statusCode: 200})
    })
  })
});

router.post('/rideComplete', function (req, res) {
  var rideRequestId = req.body.rideRequestId;
  var driver = req.body.driverId;
  console.log(rideRequestId, driver);
  rideRequest.findOne({rId: rideRequestId, driver: driver}, function (err, doc) {
    console.log("ride req comp ", err, doc);
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