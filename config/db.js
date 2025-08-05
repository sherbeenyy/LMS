const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI_TEST); //change the URI with yours
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return false;
  }
};

module.exports = connectDB;
