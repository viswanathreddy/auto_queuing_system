var mongoose = require("mongoose");

var driverSchema = mongoose.Schema({
  dId: { type: String, unique: True },
  name: { type: String },
  cabId: { type: String }
});

var Driver = mongoose.model("Driver", driverSchema);

exports.Driver = Driver;