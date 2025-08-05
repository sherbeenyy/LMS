const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/user.model");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth Routes", () => {
  const userData = {
    username: "testuser",
    password: "testpass123",
  };

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/auth/register").send(userData);
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe(true);
    });

    it("should not register a user with existing username", async () => {
      await request(app).post("/auth/register").send(userData);
      const res = await request(app).post("/auth/register").send(userData);
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe(false);
    });

    it("should return 500 if request is invalid", async () => {
      const res = await request(app).post("/auth/register").send({});
      expect(res.statusCode).toBe(500);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/auth/register").send(userData);
    });

    it("should login successfully and return a token", async () => {
      const res = await request(app).post("/auth/login").send(userData);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it("should fail with wrong password", async () => {
      const res = await request(app).post("/auth/login").send({
        username: userData.username,
        password: "wrongpassword",
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe(false);
    });

    it("should fail if user not found", async () => {
      const res = await request(app).post("/auth/login").send({
        username: "notexist",
        password: "any",
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe(false);
    });
  });
});
