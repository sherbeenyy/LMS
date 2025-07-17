const { body } = require("express-validator");

const addBookValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required.")
    .bail() //this function stops the validation chain if the previous validation failed
    .isLength({ min: 2 })
    .withMessage("Title is too short."),

  body("author").notEmpty().withMessage("Author is required."),

  body("isbn")
    .notEmpty()
    .withMessage("ISBN is required.")
    .bail()
    .isLength({ min: 13, max: 13 })
    .withMessage("ISBN must be 13 characters."),

  body("availableCopies")
    .notEmpty()
    .withMessage("Available copies is required.")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Available copies must be a non-negative number."),
];

module.exports = { addBookValidator };
