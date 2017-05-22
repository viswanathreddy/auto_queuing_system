"use strict";

var mongoose = require("mongoose");

var customerSchema = new mongoose.Schema({
  cId: {type: String, unique: true},
  name: {type: String}
});

var Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;