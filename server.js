require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDoc = YAML.load("./api.yaml");
const connectDB = require("./config/db");
const bookRoutes = require("./routes/book.route");
const customerRoutes = require("./routes/customer.route");
const receiptRoutes = require("./routes/receipt.route");
const authRoutes = require("./routes/auth.route");
const authMiddleware = require("./middlewares/auth");

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// public routes
app.use("/auth", authRoutes);

// secure everything after this line
app.use(authMiddleware);

// secured routes
app.use("/books", bookRoutes);
app.use("/customers", customerRoutes);
app.use("/receipts", receiptRoutes);

// only start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
}

module.exports = app;
