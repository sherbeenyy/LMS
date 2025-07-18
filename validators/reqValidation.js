const mongoose = require("mongoose");

const checkID = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      status: false,
      message: "Book not found.",
    };
  }
};

module.exports = { checkID };
