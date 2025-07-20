const { body } = require("express-validator");

const addcustomerValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required.")
    .bail() //this function stops the validation chain if the previous validation failed
    .isLength({ min: 3 })
    .withMessage("Name is too short."),

  body("phone")
    .notEmpty()
    .withMessage("Phone is required.")
    .bail()
    .isLength({ min: 11 })
    .withMessage("Phone should be 11 digits."),
];

const editcustomerValidator = [
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name is too short."),

  body("phone")
    .optional()
    .isLength({ min: 11 })
    .withMessage("Phone should be 11 digits."),
];
module.exports = { addcustomerValidator, editcustomerValidator };
