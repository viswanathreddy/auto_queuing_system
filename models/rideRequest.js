var mongoose = require("mongoose");
var counter = require("./counter");
const kue = require("kue");
const queue = kue.createQueue();

var rideRequestSchema = mongoose.Schema({
  rId: { type: String, unique: True },
  customer: { type: String },
  driver: { type: String },
  status: { type: String, enum: ["waiting", "ongoing", "complete"], default: "waiting"},
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