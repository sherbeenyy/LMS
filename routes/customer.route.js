const Customer = require("../models/customer.model");
const express = require("express");
const {
  addcustomerValidator,
  editcustomerValidator,
} = require("../validators/customerValidator");
const validateRequest = require("../middlewares/validateRequests");
const { checkID } = require("../validators/reqValidation");
const router = express.Router();

// POST
//customers/add
// Adds a new customer to the db
// Returns a success message
router.post("/add", addcustomerValidator, validateRequest, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const exsitingCustomer = await Customer.findOne({ phone });

    if (exsitingCustomer) {
      return res.status(400).json({
        status: false,
        message: "This phone number already exists.",
      });
    }

    const customer = new Customer({
      name,
      phone,
    });

    await customer.save();

    res.status(201).json({
      status: true,
      message: `${customer.name} added successfully !`,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//GET
//customers/all
// Fetches all customers from the db
// Returns an array of customers
router.get("/all", async (req, res) => {
  try {
    const customers = await Customer.find({});
    if (customers.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No customers found.",
      });
    }
    return res.status(200).json(customers);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET
//customers/:id
// Fetches a customer by ID from the db
// Returns the customer object
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const idCheck = checkID(id, "Customer not found.");
    if (idCheck) {
      return res.status(404).json(idCheck);
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "Customer not found.",
      });
    }
    return res.status(200).json(customer);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// PATCH
//customers/:id
// Updates a customer by ID in the db
// Returns a success message
router.patch(
  "/:id",
  editcustomerValidator,
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const idCheck = checkID(id, "Customer not found.");
      if (idCheck) {
        return res.status(404).json(idCheck);
      }

      const { name, phone } = req.body;

      // Fetch the existing customer first
      const existingCustomer = await Customer.findById(id);
      if (!existingCustomer) {
        return res.status(404).json({
          status: false,
          message: "Customer not found.",
        });
      }

      // Check if phone is being updated and if it's already used by another customer
      if (phone && phone !== existingCustomer.phone) {
        const existingWithSamePhone = await Customer.findOne({ phone });
        if (
          existingWithSamePhone &&
          existingWithSamePhone._id.toString() !== id
        ) {
          return res.status(400).json({
            status: false,
            message:
              "This phone number is already associated with another customer.",
          });
        }
      }

      // Check if any update is actually needed
      if (
        (name === undefined || name === existingCustomer.name) &&
        (phone === undefined || phone === existingCustomer.phone)
      ) {
        return res.status(200).json({
          status: true,
          message: "Nothing changed. Customer was not updated.",
        });
      }

      // Build only the fields that need updating
      const updateFields = {};
      if (name !== undefined && name.trim() !== existingCustomer.name) {
        updateFields.name = name.trim();
      }
      if (phone !== undefined && phone.trim() !== existingCustomer.phone) {
        updateFields.phone = phone.trim();
      }
      // Update only the changed fields
      const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        updateFields,
        {
          new: true,
        }
      );

      res.status(200).json({
        status: true,
        message: `${updatedCustomer.name} updated successfully!`,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE
//customers/:id
// Deletes a customer by ID from the db
// RETURNS a success message
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const idCheck = checkID(id, "Customer not found.");
    if (idCheck) {
      return res.status(404).json(idCheck);
    }

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({
        status: false,
        message: "Customer not found.",
      });
    }

    res.status(200).json({
      status: true,
      message: `${customer.name} deleted successfully!`,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = router;
