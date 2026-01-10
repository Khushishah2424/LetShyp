const Order = require("../Model/OrderModel");
const Courier = require("../Model/CourierModel");
const distance = require("../utils/distance");

/* ---------------- CREATE ORDER (ATOMIC ASSIGNMENT) ---------------- */
const createOrder = async (req, res) => {
  const { pickup, drop, deliveryType } = req.body;

  // 1. Fetch eligible couriers
  const couriers = await Courier.find({ available: true });

  // 2. Sort by distance
  const sortedCouriers = couriers
    .map(c => ({
      courier: c,
      dist: distance(c.location, pickup)
    }))
    .filter(c =>
      deliveryType === "EXPRESS" ? c.dist <= 5 : true
    )
    .sort((a, b) => a.dist - b.dist);

  let assignedCourier = null;

  // 3. Try atomic lock (CRITICAL PART)
  for (const item of sortedCouriers) {
    const lockedCourier = await Courier.findOneAndUpdate(
      { _id: item.courier._id, available: true },
      { $set: { available: false } },
      { new: true }
    );

    if (lockedCourier) {
      assignedCourier = lockedCourier;
      break;
    }
  }

  // 4. Create order
  const order = await Order.create({
    pickup,
    drop,
    deliveryType,
    courierId: assignedCourier ? assignedCourier._id : null,
    status: assignedCourier ? "ASSIGNED" : "CREATED"
  });

  // 5. Response
  if (!assignedCourier) {
    return res.json({
      message:
        deliveryType === "EXPRESS"
          ? "No courier available within express range"
          : "No courier available",
      order
    });
  }

  res.json({
    message: "Order created & courier assigned",
    order
  });
};

/* ---------------- UPDATE ORDER STATUS ---------------- */
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id).populate("courierId");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (["DELIVERED", "CANCELLED"].includes(order.status)) {
    return res.status(400).json({ message: "Order already closed" });
  }

  const validFlow = {
    CREATED: ["ASSIGNED"],
    ASSIGNED: ["PICKED_UP"],
    PICKED_UP: ["IN_TRANSIT"],
    IN_TRANSIT: ["DELIVERED"]
  };

  if (!validFlow[order.status]?.includes(status)) {
    return res.status(400).json({
      message: `Invalid status change from ${order.status} to ${status}`
    });
  }

  order.status = status;

  if (status === "DELIVERED" && order.courierId) {
    await Courier.findByIdAndUpdate(order.courierId._id, {
      available: true
    });
    order.courierId = null;
  }

  await order.save();

  res.json({ message: "Order status updated", order });
};

/* ---------------- CANCEL ORDER ---------------- */
const cancelOrder = async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate("courierId");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "DELIVERED") {
    return res.status(400).json({ message: "Cannot cancel delivered order" });
  }

  if (!["CREATED", "ASSIGNED"].includes(order.status)) {
    return res.status(400).json({
      message: `Order cannot be cancelled when status is ${order.status}`
    });
  }

  order.status = "CANCELLED";

  if (order.courierId) {
    await Courier.findByIdAndUpdate(order.courierId._id, {
      available: true
    });
    order.courierId = null;
  }

  await order.save();

  res.json({ message: "Order cancelled successfully", order });
};

module.exports = {
  createOrder,
  updateOrderStatus,
  cancelOrder
};