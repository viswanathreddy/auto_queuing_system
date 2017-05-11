"use strict";

var mongoose = require("mongoose");

var customerSchema = new Schema({
  cId: {type: String, unique: True},
  name: {type: String}
});

var Customer = mongoose.model("Customer", customerSchema);

exports.Customer = Customer;