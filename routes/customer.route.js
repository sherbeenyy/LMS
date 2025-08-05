const express = require("express");
const {
  addcustomerValidator,
  editcustomerValidator,
} = require("../validators/customerValidator");

const validateRequest = require("../middlewares/validateRequests");

const router = express.Router();

const {
  addNewCustomer,
  getAllCustomers,
  GetCustomerById,
  editCustomer,
  deleteCustomer,
} = require("../controllers/customer.controller");

// POST
//customers/add
// Adds a new customer to the db
// Returns a success message
router.post("/add", addcustomerValidator, validateRequest, addNewCustomer);

//GET
//customers/all
// Fetches all customers from the db
// Returns an array of customers
router.get("/all", getAllCustomers);

// GET
//customers/:id
// Fetches a customer by ID from the db
// Returns the customer object
router.get("/:id", GetCustomerById);

// PATCH
//customers/:id
// Updates a customer by ID in the db
// Returns a success message
router.patch("/:id", editcustomerValidator, validateRequest, editCustomer);

// DELETE
//customers/:id
// Deletes a customer by ID from the db
// RETURNS a success message
router.delete("/:id", deleteCustomer);
module.exports = router;
