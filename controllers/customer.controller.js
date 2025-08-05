const { checkID } = require("../validators/reqValidation");
const Customer = require("../models/customer.model");
const addNewCustomer = async (req, res) => {
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
};

const getAllCustomers = async (req, res) => {
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
};

const GetCustomerById = async (req, res) => {
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
};

const editCustomer = async (req, res) => {
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
    const updatedCustomer = await Customer.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    res.status(200).json({
      status: true,
      message: `${updatedCustomer.name} updated successfully!`,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteCustomer = async (req, res) => {
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
};

module.exports = {
  addNewCustomer,
  getAllCustomers,
  GetCustomerById,
  editCustomer,
  deleteCustomer,
};
