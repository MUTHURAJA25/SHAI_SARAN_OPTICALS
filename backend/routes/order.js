const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// GET /api/order - list all orders (basic admin)
router.get("/", async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// GET /api/order/:id - single order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

module.exports = router;

