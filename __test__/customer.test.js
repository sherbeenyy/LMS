const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Customer = require("../models/customer.model");
const User = require("../models/user.model");

let token;

const userCredentials = {
  username: "testuser",
  password: "testpass123",
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Clean up and create user
  await User.deleteMany({});
  await new User({ username: "customerTest", password: "testpass123" }).save();
  // Login to get token
  const res = await request(app).post("/auth/login").send({
    username: "customerTest",
    password: "testpass123",
  });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Customer.deleteMany({});
});

describe("Customer Routes", () => {
  const customerData = {
    name: "Ahmed",
    phone: "01000000000",
  };

  describe("POST /customers/add", () => {
    it("should add a new customer", async () => {
      const res = await request(app)
        .post("/customers/add")
        .set("Authorization", `Bearer ${token}`)
        .send(customerData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe(true);
    });

    it("should not add a customer with duplicate phone", async () => {
      await new Customer(customerData).save();

      const res = await request(app)
        .post("/customers/add")
        .set("Authorization", `Bearer ${token}`)
        .send(customerData);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe(false);
    });
  });

  describe("GET /customers/all", () => {
    it("should return all customers", async () => {
      await new Customer(customerData).save();

      const res = await request(app)
        .get("/customers/all")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      customerId = res.body[0]._id; // save for later tests
    });

    it("should return 404 if no customers", async () => {
      const res = await request(app)
        .get("/customers/all")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /customers/:id", () => {
    it("should get a customer by ID", async () => {
      const customer = await new Customer(customerData).save();

      const res = await request(app)
        .get(`/customers/${customer._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(customerData.name);
    });

    it("should return 404 for invalid ID format", async () => {
      const res = await request(app)
        .get("/customers/123456789012")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await request(app)
        .get(`/customers/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PATCH /customers/:id", () => {
    it("should update customer name", async () => {
      const customer = await new Customer(customerData).save();

      const res = await request(app)
        .patch(`/customers/${customer._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Name" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/updated successfully/);
    });

    it("should return message if nothing changed", async () => {
      const customer = await new Customer(customerData).save();

      const res = await request(app)
        .patch(`/customers/${customer._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: customer.name, phone: customer.phone });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Nothing changed/);
    });

    it("should not allow duplicate phone number", async () => {
      const c1 = await new Customer(customerData).save();
      const c2 = await new Customer({
        name: "Ali",
        phone: "01234567891",
      }).save();

      const res = await request(app)
        .patch(`/customers/${c2._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ phone: c1.phone });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already associated/);
    });

    it("should return 404 for invalid ID", async () => {
      const res = await request(app)
        .patch("/customers/123456789012")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "test" });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /customers/:id", () => {
    it("should delete a customer", async () => {
      const customer = await new Customer(customerData).save();

      const res = await request(app)
        .delete(`/customers/${customer._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/);
    });

    it("should return 404 if customer does not exist", async () => {
      const res = await request(app)
        .delete(`/customers/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });

    it("should return 404 for invalid ID format", async () => {
      const res = await request(app)
        .delete("/customers/invalidid123")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
