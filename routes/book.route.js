const express = require("express");
const router = express.Router();

const {
  addBook,
  getAllBooks,
  getBookById,
  editBook,
  deleteBook,
} = require("../controllers/book.controller");
const {
  addBookValidator,
  editBookValidator,
} = require("../validators/bookValidator");
const validateRequest = require("../middlewares/validateRequests");

//POST
//books/add
//Adds new book to the db
//A message of success
router.post("/add", addBookValidator, validateRequest, addBook);
//GET
//books/all
//Fetches all books from the db
//Returns an array of books
router.get("/all", getAllBooks);

//GET
//books/:id
//Fetches a book by its ID
//Returns the book object
router.get("/:id", getBookById);

//PATCH
//books/:id
//Updates a book by its ID
//Returns the updated book object with message
router.patch("/:id", editBookValidator, validateRequest, editBook);

// DELETE
// books/:id
// Deletes a book by its ID
// Returns a success message
router.delete("/:id", deleteBook);

module.exports = router;
