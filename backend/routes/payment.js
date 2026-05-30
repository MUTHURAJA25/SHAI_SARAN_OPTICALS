const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Helper to calculate totals and build order items
async function buildOrderFromCart(cartItems = []) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const items = [];
  let totalAmount = 0;

  for (const item of cartItems) {
    const { productId, quantity } = item;
    if (!productId || !quantity || quantity <= 0) {
      throw new Error("Invalid cart item");
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new Error("Product not available");
    }

    const subtotal = product.price * quantity;
    totalAmount += subtotal;

    items.push({
      product: product._id,
      name: product.name,
      type: product.type,
      quantity,
      price: product.price,
      subtotal,
    });
  }

  return { items, totalAmount };
}

// POST /api/payment/create-order
router.post("/create-order", async (req, res) => {
  try {
    const { cartItems, customer, notes } = req.body;

    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ message: "Customer name and phone required" });
    }

    const { items, totalAmount } = await buildOrderFromCart(cartItems);

    const options = {
      amount: Math.round(totalAmount * 100), // convert to paise
      currency: "INR",
      receipt: `optical_${Date.now()}`,
      notes: {
        customerName: customer.name,
        customerPhone: customer.phone,
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    const order = await Order.create({
      customer,
      items,
      totalAmount,
      currency: "INR",
      status: "pending",
      razorpay: {
        orderId: razorpayOrder.id,
      },
      notes,
    });

    res.json({
      success: true,
      orderId: order._id,
      amount: totalAmount,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order", error);
    res.status(400).json({ message: error.message || "Failed to create order" });
  }
});

// POST /api/payment/verify
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({ message: "Invalid payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      await Order.findByIdAndUpdate(orderId, {
        status: "failed",
        razorpay: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      });
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "paid",
        razorpay: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      },
      { new: true }
    );

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error verifying Razorpay payment", error);
    res.status(400).json({ message: "Failed to verify payment" });
  }
});

module.exports = router;

