const express = require("express");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDoc = YAML.load("./api.yaml");
const connectDB = require("./config/db");
const bookRoutes = require("./routes/book.route");
dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc)); // Serve Swagger UI

app.use("/book", bookRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
