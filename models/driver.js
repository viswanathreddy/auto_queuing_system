var mongoose = require("mongoose");

var driverSchema = new mongoose.Schema({
  dId: { type: String, unique: true },
  name: { type: String },
  cabId: { type: String }
});

var Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;