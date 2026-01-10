const mongoose = require("mongoose");

const courierSchema = new mongoose.Schema({
  name: String,
  location: {
    x: Number,
    y: Number
  },
  available: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Courier", courierSchema);
