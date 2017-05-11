var mongoose = require("mongoose");
var findOrCreate = require('mongoose-findorcreate');

var CounterSchema = Schema({
  _id: {type: String, required: true},
  seq: { type: Number, default: 0 }
});

CounterSchema.plugin(findOrCreate);
var Counter = mongoose.model("Counter", CounterSchema);

var logger = require("../log");

/* initialisation of counters */
Counter.findOrCreate({_id: "rideRequestId"}, function (err, requestIdDoc, created) {
  if (created) {
    log.info("requestId counter created ");
  }
});

exports.getNextSequence = function (name, cb) {
  var ret = Counter.findAndModify({
    query: { _id: name },
    update: { $inc: { seq: 1 } },
    new: true
  });
  cb(null, ret.seq);
};
