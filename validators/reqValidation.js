//this file contains the most repeated fucntions to avoid rewrite them mutiple times
const mongoose = require("mongoose");
const checkID = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      status: false,
      message,
    };
  }
};

module.exports = { checkID };
