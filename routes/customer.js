"use strict";

var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

require("../models/rideRequest");


var logger = require("../log");
var RideRequest = mongoose.model("RideRequest");

/* ride request by customer */

router.get('/', function (req, res) {
  console.log('get req customer app');
  res.render('customerapp', {message: ''});
});

router.post('/', function(req, res) {
  console.log('post req customer app');
  var customerId = req.body.cId;
  var rideReq = new RideRequest({customer: customerId});
  rideReq.save(function (err, doc) {
    if (err) {
      logger.error(err);
      return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
    }
    
    return res.render('customerapp', { message: "ride request is sent"});
  });
});

module.exports = router;
