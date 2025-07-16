const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      required: true,
    },

    isbn: {
      type: String,
      unique: true,
      required: true,
    },

    availableCopies: {
      type: Number,
      required: true,
      min: 0,
    },

    timesBorrowed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
