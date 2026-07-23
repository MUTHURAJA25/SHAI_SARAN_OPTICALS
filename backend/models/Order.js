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
    prescription: {
      patientName: { type: String, default: "" },
      patientAge: { type: Number },
      patientGender: { type: String, default: "" },
      lensIndex: { type: String, default: "" },
      lensPrice: { type: Number, default: 0 },
      lensRemarks: { type: String, default: "" },
      // Support both dist_ prefix and plain prefix for distance powers
      dist_od_sph: { type: String, default: "" },
      dist_od_cyl: { type: String, default: "" },
      dist_od_axis: { type: String, default: "" },
      dist_od_va: { type: String, default: "" },
      dist_os_sph: { type: String, default: "" },
      dist_os_cyl: { type: String, default: "" },
      dist_os_axis: { type: String, default: "" },
      dist_os_va: { type: String, default: "" },
      dist_pd: { type: String, default: "" },
      od_sph: { type: String, default: "" },
      od_cyl: { type: String, default: "" },
      od_axis: { type: String, default: "" },
      od_va: { type: String, default: "" },
      os_sph: { type: String, default: "" },
      os_cyl: { type: String, default: "" },
      os_axis: { type: String, default: "" },
      os_va: { type: String, default: "" },
      pd: { type: String, default: "" },
      near_od_sph: { type: String, default: "" },
      near_od_cyl: { type: String, default: "" },
      near_od_axis: { type: String, default: "" },
      near_od_va: { type: String, default: "" },
      near_os_sph: { type: String, default: "" },
      near_os_cyl: { type: String, default: "" },
      near_os_axis: { type: String, default: "" },
      near_os_va: { type: String, default: "" },
      near_pd: { type: String, default: "" },
      lensType: { type: String, default: "" },
      coatings: [{ type: String }]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

