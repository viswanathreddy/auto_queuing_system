/*jslint node:true white:true*/
"use strict";

var router = require("express").Router();
var mongoose = require("mongoose");

require("../models/rideRequest");
var RideRequest = mongoose.model("RideRequest");
var logger = require("../log");
var constants = require("../constants");

router.get('/stats', function (req, res) {
  RideRequest.find({}, {requestTime:0, pickupTime:0, pickupLocation:0, requestCompleteTime:0}, function (err, docs) {
    if (err) {
      loggger.error(err);
      return res.status(500).send();
    }
    docs.forEach(function (doc) {
      var elapsedSec, elapsedMin;
      if (doc.status == constants.WAITING) {
        elapsedSec = (Date.now() - doc.requestTime)/1000;
      }
      if (doc.status == constants.ONGOING)
        elapsedSec = (Date.now() - doc.pickupTime)/1000;
      if (doc.status == constants.COMPLETED)
        elapsedSec = (doc.requestCompleteTime - request.pickupTime)/1000;
      
      if (elapsedSec > 60) {
        elapsedMin = Math.floor(elapsedSec/60);
        elapsedSec = elapsedSec - (elapsedMin*60);
      }
      doc.elapsedMin = elapsedMin;
      doc.elapsedSec = elapsedSec;
    });
    return res.json(docs);
  })
});

module.exports = router;