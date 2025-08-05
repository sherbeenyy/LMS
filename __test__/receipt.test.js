const request = require("supertest");
const app = require("../server"); // Make sure `server.js` exports the app
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Book = require("../models/book.model");
const Customer = require("../models/customer.model");
const Receipt = require("../models/receipt.model");

let token;
let customerId;
let bookId1, bookId2;
let receiptId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Create user
  await User.deleteMany({});
  const user = new User({ username: "receipttest", password: "12345678" });
  await user.save();

  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username: "receipttest", password: "12345678" });

  token = loginRes.body.token;

  // Create customer
  await Customer.deleteMany({});
  const customer = await Customer.create({
    name: "Ahmed",
    phone: "01012345678",
  });
  customerId = customer._id;

  // Create books
  await Book.deleteMany({});
  const book1 = await Book.create({
    title: "Book 1",
    author: "Author A",
    isbn: "111",
    price: 50,
    copiesInStock: 20,
    totalSold: 0,
  });
  const book2 = await Book.create({
    title: "Book 2",
    author: "Author B",
    isbn: "222",
    price: 30,
    copiesInStock: 10,
    totalSold: 0,
  });
  bookId1 = book1._id;
  bookId2 = book2._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Receipt Routes", () => {
  it("should create a new receipt", async () => {
    const res = await request(app)
      .post("/receipts/add")
      .set("Authorization", `Bearer ${token}`)
      .send({
        customerId,
        books: [{ bookId: bookId1, quantity: 2 }],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe(true);
    expect(res.body.receipt.customerName).toBe("Ahmed");

    receiptId = res.body.receipt.id;
  });

  it("should return error for non-existent book", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post("/receipts/add")
      .set("Authorization", `Bearer ${token}`)
      .send({
        customerId,
        books: [{ bookId: fakeId, quantity: 1 }],
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("should return error for insufficient stock", async () => {
    const res = await request(app)
      .post("/receipts/add")
      .set("Authorization", `Bearer ${token}`)
      .send({
        customerId,
        books: [{ bookId: bookId2, quantity: 999 }],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Not enough stock/);
  });

  it("should return error for invalid customer", async () => {
    const fakeCustomer = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post("/receipts/add")
      .set("Authorization", `Bearer ${token}`)
      .send({
        customerId: fakeCustomer,
        books: [{ bookId: bookId1, quantity: 1 }],
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Customer not found/);
  });

  it("should get all receipts", async () => {
    const res = await request(app)
      .get("/receipts/all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.receipts)).toBe(true);
  });

  it("should update an existing receipt", async () => {
    const res = await request(app)
      .put(`/receipts/${receiptId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        customerId,
        books: [{ bookId: bookId2, quantity: 1 }],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.receipt.bookItems[0].bookId).toBe(String(bookId2));
  });

  it("should return error for non-existent receipt on update", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/receipts/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        customerId,
        books: [{ bookId: bookId1, quantity: 1 }],
      });

    expect(res.statusCode).toBe(404);
  });

  it("should return top 5 bestsellers", async () => {
    const res = await request(app)
      .get("/receipts/bestsellers")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.books)).toBe(true);
  });

  it("should deny access without token", async () => {
    const res = await request(app).get("/receipts/all");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Access denied/);
  });
});
