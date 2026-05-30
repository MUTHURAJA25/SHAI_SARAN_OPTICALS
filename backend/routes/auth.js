const express = require("express");

const router = express.Router();

// Placeholder auth routes so server does not break.
// You can replace this later with real signup/login logic.

router.get("/ping", (_req, res) => {
  res.json({ message: "Auth route working" });
});

module.exports = router;

