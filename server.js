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
dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc)); // Serve Swagger UI

app.use("/books", bookRoutes);
app.use("/customers", customerRoutes);
app.use("/receipts", receiptRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
