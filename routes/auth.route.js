// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing)
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });

    const user = new User({ username, password });
    await user.save();
    res
      .status(201)
      .json({ status: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({ status: true, token });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
