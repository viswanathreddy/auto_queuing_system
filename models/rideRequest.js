var mongoose = require("mongoose");
var counter = require("./counter");
const kue = require("kue");
const queue = kue.createQueue();

const constants = require("../constants");

var rideRequestSchema = mongoose.Schema({
  rId: { type: String, unique: True },
  customer: { type: String },
  driver: { type: String , default: ""},
  status: { type: String, enum: [constants.WAITING, constants.ONGOING, constants.COMPLETED], default: constants.WAITING},
  requestTime: { type: Date, default: Date.now },
  pickupTime: { type: Date },
  requestCompleteTime: { type: Date }
}, { timestamps: true });


rideRequestSchema.pre("save", function(next) {
  var doc = this;
  this.wasNew = this.isNew;
  counter.getNextSequence("rideRequestId", function (err, seq) {
    if (err)
      return next(err);
    doc.rId = seq;
    next();
  });
});

rideRequestSchema.post("save", function (rideRequest) {
  if (this.wasNew) {
    var job = queue.create("newRideRequest", {
      rId: rideRequest.rId
    }).save();
  }
});

var RideRequest = mongoose.model("RideRequest", rideRequestSchema);

exports.RideRequest = RideRequest;