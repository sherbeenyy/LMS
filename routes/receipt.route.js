const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validateRequests");
const Receipt = require("../models/receipt.model");
const Book = require("../models/book.model");
const Customer = require("../models/customer.model");
const { createReceiptValidator } = require("../validators/receiptValidator");

//POST
//receipts/add
// Creates a new receipt in the db
// Returns the created receipt with customer and book details
router.post(
  "/add",
  createReceiptValidator,
  validateRequest,
  async (req, res) => {
    try {
      const { customerId, books: bookItems } = req.body;

      // Validate customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          status: false,
          message: "Customer not found.",
        });
      }

      // Get all book IDs
      const bookIds = bookItems.map((item) => item.bookId);
      const books = await Book.find({ _id: { $in: bookIds } });

      const foundIds = books.map((book) => book._id.toString());
      const notFoundIds = bookIds.filter((id) => !foundIds.includes(id));
      if (notFoundIds.length > 0) {
        return res.status(404).json({
          status: false,
          message: "Some book IDs were not found.",
          notFoundIds,
        });
      }

      // Create a map for easy lookup
      const bookMap = {};
      books.forEach((book) => {
        bookMap[book._id.toString()] = book;
      });

      // Check stock and calculate total price
      let totalPrice = 0;
      for (const item of bookItems) {
        const book = bookMap[item.bookId];
        const quantity = item.quantity;

        if (book.copiesInStock < quantity) {
          return res.status(400).json({
            status: false,
            message: `Not enough stock for book "${book.title}". Available: ${book.copiesInStock}, Requested: ${quantity}`,
          });
        }

        totalPrice += book.price * quantity;
      }

      // Update book stocks
      await Promise.all(
        bookItems.map(({ bookId, quantity }) =>
          Book.findByIdAndUpdate(bookId, {
            $inc: {
              copiesInStock: -quantity,
              totalSold: quantity,
            },
          })
        )
      );

      // Save receipt
      const receipt = new Receipt({
        customerId,
        books: bookItems,
        totalPrice,
      });

      const savedReceipt = await receipt.save();

      res.status(201).json({
        status: true,
        message: "Receipt created successfully.",
        receipt: {
          id: savedReceipt._id,
          customerName: customer.name,
          bookItems: bookItems.map(({ bookId, quantity }) => ({
            bookId,
            quantity,
            title: bookMap[bookId].title,
            price: bookMap[bookId].price,
          })),
          totalPrice,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: "Server error while creating receipt.",
      });
    }
  }
);

module.exports = router;
