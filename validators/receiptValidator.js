const { body } = require("express-validator");

const createReceiptValidator = [
  body("customerId")
    .notEmpty()
    .withMessage("customerId is required")
    .isMongoId()
    .withMessage("Invalid customerId"),

  body("books")
    .isArray({ min: 1 })
    .withMessage("books must be a non-empty array"),

  body("books.*.bookId")
    .notEmpty()
    .withMessage("bookId is required")
    .isMongoId()
    .withMessage("Each book must have a valid ID"),

  body("books.*.quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ min: 1 })
    .withMessage("quantity must be a positive integer"),
];

module.exports = { createReceiptValidator };
