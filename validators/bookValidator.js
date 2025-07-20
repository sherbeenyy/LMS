const { body } = require("express-validator");

const addBookValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required.")
    .bail() //this function stops the validation chain if the previous validation failed
    .isLength({ min: 3 })
    .withMessage("Title is too short."),

  body("author")
    .notEmpty()
    .withMessage("Author is required.")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Author is too short."),

  body("isbn")
    .notEmpty()
    .withMessage("ISBN is required.")
    .bail()
    .isLength({ min: 13, max: 13 })
    .withMessage("ISBN must be 13 characters."),

  body("copiesInStock")
    .notEmpty()
    .withMessage("Copies in stock is required.")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Minimum numbers of copies in stock should be 1."),

  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number."),
];

const editBookValidator = [
  body("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Title is too short."),

  body("author")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Author is too short."),

  body("isbn")
    .optional()
    .isLength({ min: 13, max: 13 })
    .withMessage("ISBN must be 13 characters."),

  body("copiesInStock")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Minimum numbers of copies in stock should be 1."),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number."),
];
module.exports = { addBookValidator, editBookValidator };
