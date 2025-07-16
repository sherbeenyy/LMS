const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bookRoutes = require("./routes/book.route");

dotenv.config();

const app = express();
app.use(express.json());

connectDB(); //database connection

app.use("/book", bookRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
