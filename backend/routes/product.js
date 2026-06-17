  const express = require("express");
  const Product = require("../models/Product");

  const router = express.Router();

  // GET /api/products - list products with optional filters
  router.get("/", async (req, res) => {
    try {
      const { type, brand, minPrice, maxPrice, search } = req.query;
      const filter = { isActive: true };

      if (type) {
        filter.type = type;
      }
      if (brand) {
        filter.brand = brand;
      }
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }
      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      const products = await Product.find(filter).sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // GET /api/products/:id - single product
  router.get("/:id", async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // POST /api/products - create product (simple admin; no auth added here)
  router.post("/", async (req, res) => {
    try {
      const product = new Product(req.body);
      const saved = await product.save();
      res.status(201).json(saved);
    } catch (error) {
      console.error("Error creating product", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  // PUT /api/products/:id - update product
  router.put("/:id", async (req, res) => {
    try {
      const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating product", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  // DELETE /api/products/:id - soft delete (set isActive = false)
  router.delete("/:id", async (req, res) => {
    try {
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deactivated" });
    } catch (error) {
      console.error("Error deleting product", error);
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  module.exports = router;

