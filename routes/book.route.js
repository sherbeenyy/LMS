// routes/book.routes.js
const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

const { addBookValidator } = require("../validators/bookValidator");
const validateRequest = require("../middlewares/validateRequests");

router.post("/add", addBookValidator, validateRequest, async (req, res) => {
  try {
    const { title, author, isbn, availableCopies } = req.body;

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        status: false,
        message: "This book already exists.",
      });
    }

    const book = new Book({
      title,
      author,
      isbn,
      availableCopies: Number(availableCopies),
    });

    await book.save();

    res.status(201).json({
      status: true,
      message: `${book.title} added successfully !`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Failed to add book: " + err.message,
    });
  }
});

module.exports = router;
