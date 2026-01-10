const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  pickup: { x: Number, y: Number },
  drop: { x: Number, y: Number },
  deliveryType: {
    type: String,
    enum: ["EXPRESS", "NORMAL"]
  },
  status: {
    type: String,
    enum: ["CREATED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED","CANCELLED"],
    default: "CREATED"
  },
  courierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courier",
    default: null
  }
});

module.exports = mongoose.model("Order", orderSchema);
