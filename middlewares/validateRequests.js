// middlewares/validateRequest.js
const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Validation failed.",
      errors: errors.array().map((e) => e.msg),
    });
  }

  next();
};

module.exports = validateRequest;
