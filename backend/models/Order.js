const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["frame", "lens", "contact-lens"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // price per unit at time of order
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String }, // optional if pickup in store
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
    razorpay: {
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
    },
    notes: { type: String }, // e.g., prescription details
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

