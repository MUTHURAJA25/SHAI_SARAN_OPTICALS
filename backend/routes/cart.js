const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// POST /api/cart/validate - validate cart items and return refreshed data
router.post("/validate", async (req, res) => {
  try {
    const { cartItems } = req.body;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const validated = [];

    for (const item of cartItems) {
      const { productId, quantity } = item;
      const product = await Product.findById(productId);
      if (!product || !product.isActive) continue;

      validated.push({
        productId: product._id,
        name: product.name,
        type: product.type,
        price: product.price,
        quantity,
        maxQuantity: product.stock,
      });
    }

    res.json({ items: validated });
  } catch (error) {
    console.error("Error validating cart", error);
    res.status(500).json({ message: "Failed to validate cart" });
  }
});

module.exports = router;

