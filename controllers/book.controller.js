const { checkID } = require("../validators/reqValidation");
const Book = require("../models/book.model");

const addBook = async (req, res) => {
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
};

const getAllBooks = async (req, res) => {
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
};

const getBookById = async (req, res) => {
  const { id } = req.params;

  // if the object ID is not valid, return 404 not the actual error for security
  const idCheck = checkID(id, "Book not found.");
  if (idCheck) {
    return res.status(404).json(idCheck);
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
};

const editBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, copiesInStock, price } = req.body;

  const idCheck = checkID(id, "Book not found.");
  if (idCheck) {
    return res.status(404).json(idCheck);
  }

  try {
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).json({
        status: false,
        message: "Book not found.",
      });
    }

    // Prevent reducing the stock
    if (
      copiesInStock !== undefined &&
      Number(copiesInStock) < Number(existingBook.copiesInStock)
    ) {
      return res.status(400).json({
        status: false,
        message:
          "You cannot reduce the number of copies in stock below the existing value.",
      });
    }

    // Check for duplicate ISBN
    if (isbn && isbn !== existingBook.isbn) {
      const existingWithSameISBN = await Book.findOne({ isbn });
      if (existingWithSameISBN && existingWithSameISBN._id.toString() !== id) {
        return res.status(400).json({
          status: false,
          message: "Another book with this ISBN already exists.",
        });
      }
    }

    // Check for actual changes
    const updateFields = {};
    if (title !== undefined && title !== existingBook.title)
      updateFields.title = title;
    if (author !== undefined && author !== existingBook.author)
      updateFields.author = author;
    if (isbn !== undefined && isbn !== existingBook.isbn)
      updateFields.isbn = isbn;
    if (
      copiesInStock !== undefined &&
      copiesInStock !== existingBook.copiesInStock
    )
      updateFields.copiesInStock = copiesInStock;
    if (price !== undefined && price !== existingBook.price)
      updateFields.price = price;

    // If no actual updates, respond accordingly
    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({
        status: true,
        message: "Nothing changed. Book was not updated.",
      });
    }

    const book = await Book.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

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
};

const deleteBook = async (req, res) => {
  const { id } = req.params;

  const idCheck = checkID(id, "Book not found.");
  if (idCheck) {
    return res.status(404).json(idCheck);
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
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  editBook,
  deleteBook,
};
