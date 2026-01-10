const router = require("express").Router();
const { createOrder ,updateOrderStatus,cancelOrder} = require("../Controller/OrderController");

router.post("/", createOrder);
router.patch("/:id/status", updateOrderStatus);
router.delete("/:id", cancelOrder);

module.exports = router;
