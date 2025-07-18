// routes/book.routes.js
const express = require("express");
const mongoose = require("mongoose");
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

//PATCH
//books/:id
//Updates a book by its ID
//Returns the updated book object with message
router.patch("/:id", addBookValidator, validateRequest, async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, copiesInStock, price } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      status: false,
      message: "Book not found.",
    });
  }

  try {
    //fetching the original book and comapre the stock to prevent admin from reducting the stock
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).json({
        status: false,
        message: "Book not found.",
      });
    }
    if (Number(copiesInStock) < Number(existingBook.copiesInStock)) {
      return res.status(400).json({
        status: false,
        message:
          "You cannot reduce the number of copies in stock below the existing value.",
      });
    }

    // Prevent duplicate ISBNs (exclude this book itself)
    if (isbn && isbn !== existingBook.isbn) {
      const existingWithSameISBN = await Book.findOne({ isbn });
      if (existingWithSameISBN && existingWithSameISBN._id.toString() !== id) {
        return res.status(400).json({
          status: false,
          message: "Another book with this ISBN already exists.",
        });
      }
    }

    // Update the book
    const book = await Book.findByIdAndUpdate(
      id,
      { title, author, isbn, copiesInStock, price },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Book updated successfully.",
      book,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Failed to update book: " + err.message,
    });
  }
});

// DELETE
// books/:id
// Deletes a book by its ID
// Returns a success message
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      status: false,
      message: "Book not found.",
    });
  }

  try {
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({
        status: false,
        message: "Book not found.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Book deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Failed to delete book: " + err.message,
    });
  }
});

module.exports = router;
