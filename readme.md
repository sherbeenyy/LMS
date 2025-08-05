# LMS – Library Management System API

## Overview

The **Library Management System (LMS)** API is a backend application built with **Node.js**, **Express**, and **MongoDB**. It allows libraries and bookshops to manage:

- 📕 Books (inventory, sales, prices)
- 👥 Customers
- 🧾 Sales receipts
- 📈 Identify top 5 best-selling books

It follows a secure, layered architecture and includes **Swagger API documentation**, **JWT authentication**, and **professional test coverage using Jest & Supertest**.

---

## Architecture & Request Lifecycle

The project uses **layered architecture** to ensure scalability, testability, and modularity.

### Request Flow

```
Client → Middleware → Validation → Route Handler → Database → Response
```

### Project Structure

```
LMS/
├── routes/             # Route files for books, receipts, customers, auth
├── models/             # Mongoose schemas
├── models/             # Mongoose schemas
├── middlewares/        # Authentication, request validation error handling
├── validators/         # Joi validators for request bodies
├── config/             # MongoDB connection setup
├── __test__/           # All tests using Jest & Supertest
├── api.yaml            # Swagger/OpenAPI documentation
├── server.js           # Entry point of the app
└── .env                # Environment variables
```

---

## Authentication & Middleware

### JWT Middleware

All sensitive routes are protected using **JWT-based middleware**.

Example:

```
Authorization: Bearer <your_token>
```

- If the token is valid → access granted
- If invalid or missing → returns `401 Unauthorized` or `403 Forbidden`

### Request Validation

All route inputs are validated using **Joi** schemas (e.g., `bookValidator.js`, `receiptValidator.js`) before hitting the business logic.

If the validation fails, a helpful message is returned early.

---

## API Documentation

All routes are documented using **Swagger (OpenAPI v3)** and grouped by category:

- `/books` → Book management
- `/customers` → Customer operations
- `/receipts` → Receipt management
- `/auth` → User login/register
- `/receipts/bestsellers` → Bestsellers report

### Access Swagger UI

After starting the server, go to:

```
http://localhost:{port}/api-docs
```

You’ll be able to explore all APIs, test them live, and view detailed schemas.

---

## Testing

All endpoints are covered with **Jest** and **Supertest**.

### Coverage Includes:

- Auth (register/login with hashed passwords)
- CRUD operations for:
  - Books
  - Customers
  - Receipts
- Token-based access control
- Edge cases (e.g., duplicate entries, insufficient stock, invalid IDs)

### Run Tests

```bash
npm test
```

Or run an individual file:

```bash
npx jest __test__/book.test.js
```

---

## Local Setup

### 1. Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- npm or yarn

### 2. Clone & Install

```bash
git clone https://github.com/your-username/lms-api.git
cd lms-api
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=your_jwt_secret_key
```

### 4. Run the Server

```bash
npm run dev
```

The API will be available at:

```
http://localhost:{port}
```

And Swagger docs at:

```
http://localhost:{port}/api-docs
```

---

## Core Features

| Feature            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| 🧾 Create Receipts | Track books sold to customers                        |
| 📈 Best Sellers    | Analyze and view top 5 best-selling books            |
| 📚 Book Inventory  | Add, edit, delete, or fetch books                    |
| 👥 Customers       | Manage customer data with duplicate-checking logic   |
| 🔐 Secure Access   | JWT-based protected routes for all resources         |
| 🧪 Tests           | All routes are covered with professional test suites |

---

## Built With

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework
- **MongoDB + Mongoose** – NoSQL database & ODM
- **Joi** – Input validation
- **JWT** – Secure user sessions
- **Swagger (YAML)** – API documentation
- **Jest + Supertest** – Testing framework

---

## Future Enhancements (Ideas)

- 📊 Dashboard with visual stats
- 👨‍🏫 User roles (admin, staff)
- 📅 Borrowing system with due dates
- 💬 Email/SMS notifications
- 🧠 AI recommendations for popular books

---

## License

This project is licensed under the **MIT License**.

---

## Author

Made by **Ahmed Hesham Elsherbeeny**
