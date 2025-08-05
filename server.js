const express = require("express");
const dotenv = require("dotenv");
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
dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc)); // Serve Swagger UI

//public routes
app.use("/auth", authRoutes);

//secure every thing below this
app.use(authMiddleware);

//secured routes
app.use("/books", bookRoutes);
app.use("/customers", customerRoutes);
app.use("/receipts", receiptRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
