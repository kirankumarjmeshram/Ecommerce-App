# ShopSphere — Ecommerce-App (MERN Stack)

ShopSphere is the replaceable storefront display brand. Repository/package names remain Ecommerce-App. The UI uses React Bootstrap with a shared neutral/teal theme, responsive product cards, INR formatting, accessible form controls, checkout summaries and admin tables. Branding lives in Header, Footer, HomeScreen and public metadata.

## Documentation

Current engineering documentation, architecture, API inventory, security notes, and planned work are in [docs/README.md](docs/README.md).

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
* Secure Razorpay checkout and backend payment signature verification

### 🛠️ Admin Features

* Add / Update / Delete Products
* Manage Orders
* Manage Users
* View current-process observability charts with Recharts

---

## 🧱 Tech Stack

### Frontend

* React.js
* React Router
* Axios
* React Bootstrap / shared CSS tokens
* Redux Toolkit / RTK Query
* Recharts

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Redis cache-aside product caching with invalidation and fallback
* Pino structured logging, request IDs, Prometheus metrics, health/readiness probes

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
4. The JWT is set in an HttpOnly cookie; the frontend receives safe user information
5. Browser requests include the cookie; backend middleware checks authentication and admin roles

---

## 📡 API Endpoints (Sample)

### Auth

* `POST /api/users` → Register user
* `POST /api/users/auth` → Login user

### Products

* `GET /api/products` → Get all products
* `GET /api/products/:id` → Get single product

### Cart

Cart items and shipping details use Redux and browser localStorage; there is no server cart endpoint.

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

Configure the root `.env` using `backend/.env.example` as a placeholder reference. See [environment documentation](docs/operations/environment-variables.md) and [deployment readiness](docs/operations/deployment-readiness.md).

```
PORT=5001
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

* 🔹 Rate limiting for API protection
* 🔹 Refresh token authentication
* 🔹 Queue system for order processing
* 🔹 Docker deployment

---

## Tests and CI

Backend tests use Jest, Supertest and disposable MongoDB. Frontend tests use CRA/Testing Library. GitHub Actions validates the frontend and backend independently; deployment is a separate phase and is not claimed here.

```sh
npm test --prefix backend
npm test --prefix frontend -- --watchAll=false
npm run build --prefix frontend
```

See [test strategy](docs/testing/test-strategy.md) and [CI documentation](docs/operations/continuous-integration.md) for current scope and limitations.

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
