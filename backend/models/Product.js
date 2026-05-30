const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["frame", "lens", "contact-lens"],
      required: true,
    },
    brand: { type: String },
    price: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    // Additional attributes depending on product type
    attributes: {
      size: { type: String }, // e.g., Small, Medium, Large
      color: { type: String },
      material: { type: String }, // e.g., Metal, Plastic
      shape: { type: String }, // e.g., Round, Square
      powerRange: { type: String }, // e.g., -2.00 to -8.00
      lensType: { type: String }, // e.g., Single Vision, Bifocal
      baseCurve: { type: String }, // mainly for contact lenses
      diameter: { type: String }, // for lenses/contact lenses
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

