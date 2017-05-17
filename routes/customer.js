"use strict";

var express = require('express');
var router = express.Router();

require("../mpdels/rideRequest");


var logger = require("../log");
var RideRequest = mongoose.model("RideRequest");

/* ride request by customer */
router.post('/ride', function(req, res) {
  var customerId = req.body.cId;
  var rideReq = new RideRequest({customer: customerId});
  rideReq.save(function (err, doc) {
    if (err) {
      logger.error(err);
      return res.send(JSON.stringify(err), {'Content-Type': 'application/json'}, 500);
    }
    
    return res.json();
  });
});

module.exports = router;
