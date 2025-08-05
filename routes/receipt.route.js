const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validateRequests");
const {
  addNewReceipt,
  getAllReceipts,
  editReceipt,
  getBestSellingBooks,
} = require("../controllers/receipt.controller");
const { createReceiptValidator } = require("../validators/receiptValidator");

//POST
//receipts/add
// Creates a new receipt in the db
// Returns the created receipt with customer and book details
router.post("/add", createReceiptValidator, validateRequest, addNewReceipt);

// GET
// /receipts
// Returns all receipts with customer and book details
router.get("/all", getAllReceipts);

// PUT
// /receipts/:id/edit
// Edits an existing receipt, updates stock and totalSold correctly
router.put("/:id", createReceiptValidator, validateRequest, editReceipt);

// GET
// /receipts/bestsellers
// Returns the top 5 best-selling books
router.get("/bestsellers", getBestSellingBooks);

module.exports = router;
