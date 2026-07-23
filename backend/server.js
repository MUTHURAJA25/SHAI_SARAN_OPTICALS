const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongo:27017/opticalshop";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    try {
      const seedDatabase = require("./config/seed");
      await seedDatabase();
    } catch (seedErr) {
      console.error("Database seeding failed:", seedErr);
    }
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/product"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/order", require("./routes/order"));
app.use("/api/payment", require("./routes/payment"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
