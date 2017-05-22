/*jslint node:true white:true*/
"use strict";

var router = require("express").Router();
var mongoose = require("mongoose");

require("../models/rideRequest");
var RideRequest = mongoose.model("RideRequest");
var logger = require("../log");
var constants = require("../constants");

router.get('/', function (req, res) {
  RideRequest.find({}, function (err, docs) {
    if (err) {
      loggger.error(err);
      return res.status(500).send();
    }
    docs.forEach(function (doc) {
      if (doc.driver == '')
        doc.driver = 'None';
      var elapsedSec, elapsedMin;
      if (doc.status == constants.WAITING) {
        elapsedSec = (Date.now() - doc.requestTime)/1000;
      }
      if (doc.status == constants.ONGOING)
        elapsedSec = (Date.now() - doc.pickupTime)/1000;
      if (doc.status == constants.COMPLETED)
        elapsedSec = (doc.requestCompleteTime - doc.pickupTime)/1000;
      
      if (elapsedSec > 60) {
        elapsedMin = Math.floor(elapsedSec/60);
        elapsedSec = elapsedSec - (elapsedMin*60);
      }
      elapsedSec = Number(elapsedSec).toFixed(2)
      doc.elapsedTime = elapsedMin + ' mins ' + elapsedSec + ' secs ago'
    });
    console.log('docs ', docs);
    return res.render('dashboard', {items: docs});
  })
});

module.exports = router;