// routes/book.routes.js
const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

//POST
//PATH : book/add
//desc : Add a new book
router.post("/add", async (req, res) => {
  try {
    const { title, author, isbn, availableCopies } = req.body;

    if (!title || !author || !isbn || !availableCopies) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required." });
    }

    if (isbn.length !== 13) {
      return res
        .status(400)
        .json({ status: false, message: "ISBN must be 13 characters long." });
    }
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      res
        .status(400)
        .json({ status: false, message: "This book already exists." });
    }

    if (availableCopies < 0) {
      return res.json({
        status: false,
        message: "Available copies cannot be negative.",
      });
    }

    const book = new Book({
      title,
      author,
      isbn,
      availableCopies: Number(availableCopies),
    });

    await book.save();

    res
      .status(201)
      .json({ status: true, message: `"${book.title}" added successfully!` });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, message: "Failed to add book: " + err.message });
  }
});

module.exports = router;
