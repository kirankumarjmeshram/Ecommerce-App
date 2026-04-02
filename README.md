# 🛒 Ecommerce-App (MERN Stack)

A full-stack **E-commerce Web Application** built using the MERN stack (MongoDB, Express, React, Node.js).
This project demonstrates end-to-end functionality of an online shopping platform including authentication, product management, cart, and order processing.

---

## 🚀 Features

### 👤 User Features

* User Registration & Login (JWT based authentication)
* Browse Products
* Add to Cart / Remove from Cart
* Place Orders
* View Order History

### 🛠️ Admin Features

* Add / Update / Delete Products
* Manage Orders
* Manage Users

---

## 🧱 Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Bootstrap / CSS

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Authentication

* JSON Web Tokens (JWT)

---

## 🏗️ Architecture Overview

```
Frontend (React)
      ↓
API Layer (Express Routes)
      ↓
Controllers (Business Logic)
      ↓
Models (MongoDB via Mongoose)
      ↓
Database (MongoDB)
```

---

## 📂 Project Structure

```
Ecommerce-App/
│
├── frontend/           # React frontend
│   ├── src/
│   └── public/
│
├── backend/            # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── config/
│
└── README.md
```

---

## 🔐 Authentication Flow

1. User logs in with credentials
2. Server validates user
3. JWT token is generated
4. Token is sent to client
5. Client sends token in headers for protected routes

---

## 📡 API Endpoints (Sample)

### Auth

* `POST /api/users/register` → Register user
* `POST /api/users/login` → Login user

### Products

* `GET /api/products` → Get all products
* `GET /api/products/:id` → Get single product

### Cart

* `POST /api/cart` → Add to cart
* `DELETE /api/cart/:id` → Remove item

### Orders

* `POST /api/orders` → Place order
* `GET /api/orders/myorders` → User orders

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/kirankumarjmeshram/Ecommerce-App.git
cd Ecommerce-App
```

### 2️⃣ Backend Setup

```
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

Run backend:

```
npm start
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm start
```

---

## 🌐 Environment Variables

| Variable   | Description               |
| ---------- | ------------------------- |
| MONGO_URI  | MongoDB connection string |
| JWT_SECRET | Secret key for JWT        |
| PORT       | Server port               |

---

## 📈 Future Improvements (Important for Scaling)

* 🔹 Redis caching for faster product APIs
* 🔹 Rate limiting for API protection
* 🔹 Refresh token authentication
* 🔹 Queue system for order processing
* 🔹 Logging & monitoring (Winston/Morgan)
* 🔹 Docker deployment

---

## 🧠 Key Learnings

* Building scalable REST APIs
* JWT-based authentication
* Full-stack integration (React + Node)
* MongoDB schema design

---

## 📸 Screenshots

(Add your project screenshots here)

---

## 🤝 Contribution

Feel free to fork this repo and contribute!

---

## 📬 Contact

**Author:** Kirankumar J Meshram

* GitHub: [https://github.com/kirankumarjmeshram](https://github.com/kirankumarjmeshram)

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
