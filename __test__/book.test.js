const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Book = require("../models/book.model");
const User = require("../models/user.model");

let token = "";
let bookId = "";

const bookData = {
  title: "Atomic Habits",
  author: "James Clear",
  isbn: "1234567891234",
  price: 100,
  copiesInStock: 10,
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);

  // Register and login a user
  await User.deleteMany({});
  await request(app)
    .post("/auth/register")
    .send({ username: "bookuserTest", password: "bookuserTest" });
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username: "bookuserTest", password: "bookuserTest" });
  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Book.deleteMany({});
});

describe("Book Routes", () => {
  it("should add a new book", async () => {
    const res = await request(app)
      .post("/books/add")
      .set("Authorization", `Bearer ${token}`)
      .send(bookData);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe(true);
  });

  it("should fail to add a book with duplicate ISBN", async () => {
    await new Book(bookData).save();
    const res = await request(app)
      .post("/books/add")
      .set("Authorization", `Bearer ${token}`)
      .send(bookData);

    expect(res.statusCode).toBe(400);
  });

  it("should fetch all books", async () => {
    const newBook = await new Book(bookData).save();
    const res = await request(app)
      .get("/books/all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    bookId = res.body[0]._id;
  });

  it("should get a book by ID", async () => {
    const book = await new Book(bookData).save();
    const res = await request(app)
      .get(`/books/${book._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe(bookData.title);
  });

  it("should return 404 for invalid book ID", async () => {
    const res = await request(app)
      .get("/books/123456789012")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("should update book with new values", async () => {
    const book = await new Book(bookData).save();
    const res = await request(app)
      .patch(`/books/${book._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.book.title).toBe("Updated Title");
  });

  it("should return message for no changes in update", async () => {
    const book = await new Book(bookData).save();
    const res = await request(app)
      .patch(`/books/${book._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: bookData.title });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Nothing changed/);
  });

  it("should not allow reducing stock", async () => {
    const book = await new Book(bookData).save();
    const res = await request(app)
      .patch(`/books/${book._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ copiesInStock: 5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot reduce the number of copies/);
  });

  it("should not allow duplicate ISBNs during update", async () => {
    const book1 = await new Book(bookData).save();
    const book2 = await new Book({
      title: "Other Book",
      author: "Author B",
      isbn: "9876543210",
      price: 200,
      copiesInStock: 5,
    }).save();

    const res = await request(app)
      .patch(`/books/${book2._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isbn: bookData.isbn });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/);
  });

  it("should delete a book by ID", async () => {
    const book = await new Book(bookData).save();
    const res = await request(app)
      .delete(`/books/${book._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/);
  });

  it("should return 404 when deleting non-existent book", async () => {
    const res = await request(app)
      .delete(`/books/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
