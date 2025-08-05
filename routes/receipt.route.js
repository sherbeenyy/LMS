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

// GET
// /receipts
// Returns all receipts with customer and book details
router.get("/all", async (req, res) => {
  try {
    const receipts = await Receipt.find()
      .sort({ createdAt: -1 }) // Newest first
      .populate("customerId", "name") // Only get customer name
      .lean(); // Convert to plain JS objects for performance

    const bookIds = receipts.flatMap((receipt) =>
      receipt.books.map((item) => item.bookId)
    );

    // Fetch all referenced books once
    const books = await Book.find({ _id: { $in: bookIds } }).lean();
    const bookMap = {};
    books.forEach((book) => {
      bookMap[book._id.toString()] = book;
    });

    // Format receipts
    const formattedReceipts = receipts.map((receipt) => ({
      id: receipt._id,
      customerName: receipt.customerId.name,
      totalPrice: receipt.totalPrice,
      bookItems: receipt.books.map((item) => {
        const book = bookMap[item.bookId.toString()];
        return {
          bookId: item.bookId,
          title: book?.title || "Book not found",
          price: book?.price || 0,
          quantity: item.quantity,
        };
      }),
      createdAt: receipt.createdAt,
    }));

    res.status(200).json({
      status: true,
      receipts: formattedReceipts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Server error while fetching receipts.",
    });
  }
});

// PUT
// /receipts/:id/edit
// Edits an existing receipt, updates stock and totalSold correctly
router.put(
  "/:id",
  createReceiptValidator,
  validateRequest,
  async (req, res) => {
    try {
      const receiptId = req.params.id;
      const { customerId, books: newBookItems } = req.body;

      const existingReceipt = await Receipt.findById(receiptId);
      if (!existingReceipt) {
        return res
          .status(404)
          .json({ status: false, message: "Receipt not found." });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ status: false, message: "Customer not found." });
      }

      // Validate new book IDs
      const newBookIds = newBookItems.map((item) => item.bookId);
      const books = await Book.find({ _id: { $in: newBookIds } });
      const foundIds = books.map((b) => b._id.toString());
      const notFoundIds = newBookIds.filter((id) => !foundIds.includes(id));

      if (notFoundIds.length > 0) {
        return res.status(404).json({
          status: false,
          message: "Some book IDs were not found.",
          notFoundIds,
        });
      }

      const bookMap = {};
      books.forEach((book) => {
        bookMap[book._id.toString()] = book;
      });

      // Check stock and calculate total price
      let totalPrice = 0;
      for (const item of newBookItems) {
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

      // revert old book stocks and totalSold
      await Promise.all(
        existingReceipt.books.map(async ({ bookId, quantity }) => {
          await Book.findByIdAndUpdate(bookId, {
            $inc: {
              copiesInStock: quantity,
              totalSold: -quantity,
            },
          });
        })
      );

      //apply new stock changes
      await Promise.all(
        newBookItems.map(({ bookId, quantity }) =>
          Book.findByIdAndUpdate(bookId, {
            $inc: {
              copiesInStock: -quantity,
              totalSold: quantity,
            },
          })
        )
      );

      //Save updated receipt
      existingReceipt.customerId = customerId;
      existingReceipt.books = newBookItems;
      existingReceipt.totalPrice = totalPrice;
      const updatedReceipt = await existingReceipt.save();

      res.status(200).json({
        status: true,
        message: "Receipt updated successfully.",
        receipt: {
          id: updatedReceipt._id,
          customerName: customer.name,
          bookItems: newBookItems.map(({ bookId, quantity }) => ({
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
        message: "Server error while editing receipt.",
      });
    }
  }
);

// GET
// /receipts/bestsellers
// Returns the top 5 best-selling books
router.get("/bestsellers", async (req, res) => {
  try {
    const topBooks = await Book.find({})
      .sort({ totalSold: -1 })
      .limit(5)
      .select("title author totalSold");

    res.status(200).json({
      status: true,
      message: "Top 5 best-selling books.",
      books: topBooks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Server error while fetching bestsellers.",
    });
  }
});

module.exports = router;
