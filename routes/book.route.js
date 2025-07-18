// routes/book.routes.js
const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

const { addBookValidator } = require("../validators/bookValidator");
const validateRequest = require("../middlewares/validateRequests");

router.post("/add", addBookValidator, validateRequest, async (req, res) => {
  try {
    const { title, author, isbn, copiesInStock, price } = req.body;

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
      price: Number(price),
      copiesInStock: Number(copiesInStock),
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

router.get("/all", async (req, res) => {
  try {
    const books = await Book.find({});
    if (books.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No books found." });
    }
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Server error while fetching books." });
  }
});

module.exports = router;
