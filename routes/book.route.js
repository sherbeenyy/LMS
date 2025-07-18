// routes/book.routes.js
const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

const { addBookValidator } = require("../validators/bookValidator");
const validateRequest = require("../middlewares/validateRequests");

//POST
//books/add
//Adds new book to the db
//A message of success
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
//GET
//books/all
//Fetches all books from the db
//Returns an array of books
router.get("/all", async (req, res) => {
  try {
    const books = await Book.find({});
    if (books.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No books found." });
    }
    res.status(200).json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching books." });
  }
});

//GET
//books/:id
//Fetches a book by its ID
//Returns the book object
const mongoose = require("mongoose");

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // if the object ID is not valid, return 404 not the actual error for security
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      status: false,
      message: "Book not found.",
    });
  }

  try {
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        status: false,
        message: "Book not found.",
      });
    }

    res.status(200).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error while fetching book.",
      error: err.message,
    });
  }
});

module.exports = router;
