const { body } = require("express-validator");

const createReceiptValidator = [
  body("customerId")
    .notEmpty()
    .withMessage("customerId is required")
    .isMongoId()
    .withMessage("Invalid customerId"),

  body("bookIds")
    .isArray({ min: 1 })
    .withMessage("bookIds must be a non-empty array"),

  body("bookIds.*").isMongoId().withMessage("each book must have a valid id"),
];

module.exports = { createReceiptValidator };
