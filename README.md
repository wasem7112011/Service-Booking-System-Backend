# Service Booking System — Backend

A RESTful backend API for a service appointment booking system, built with Node.js, Express.js, TypeScript, and MongoDB.

The backend handles authentication, users, services, appointment availability, bookings, and booking status management.

## 🚀 Features

* 🔐 User authentication with JWT
* 🔑 Password hashing with bcrypt
* 👤 User management
* 📅 Appointment and slot management
* 📝 Booking creation and management
* 🚫 Duplicate active booking prevention
* 📊 Booking status management
* 🗄️ MongoDB database integration with Mongoose
* 🛡️ Protected API endpoints
* 🔒 Security headers with Helmet
* ⏱️ API rate limiting
* 🌐 CORS configuration
* 🌱 Database seed script

## 🛠️ Tech Stack

* **Node.js** — JavaScript runtime
* **Express.js** — REST API framework
* **TypeScript** — Type-safe backend development
* **MongoDB** — Database
* **Mongoose** — MongoDB ODM
* **JWT** — Authentication
* **bcrypt** — Password hashing
* **Helmet** — HTTP security headers
* **express-rate-limit** — Request rate limiting
* **dotenv** — Environment configuration

## 🏗️ Project Structure

```text
Service-Booking-System-Backend/
├── src/
│   ├── ...
│   ├── server.ts
│   └── seed.ts
├── .env.example
├── package.json
├── tsconfig.json
└── package-lock.json
```

The backend is written in TypeScript and compiled into the `dist` directory for production.

## 🔐 Authentication

The API uses JWT-based authentication to protect authenticated resources.

Passwords are hashed using bcrypt before being stored in the database.

Authenticated requests provide the required token so the backend can identify and authorize the user.

## 📅 Booking System

The backend manages the complete booking lifecycle:

```text
Available Slot
      ↓
Booking Request
      ↓
Validate Availability
      ↓
Create Booking
      ↓
Booking Status
      ↓
Manage / Complete Booking
```

The booking logic includes validation to prevent users from creating conflicting active bookings.

## 🗄️ Database

MongoDB is used as the primary database through Mongoose.

The backend persists application data such as:

* Users
* Services
* Appointment slots
* Bookings
* Booking statuses

## 🛡️ API Security

Several server-side protections are included:

* JWT authentication
* Password hashing
* Protected routes
* Helmet security headers
* Rate limiting
* CORS configuration
* Environment variables for sensitive configuration

## ⚙️ Getting Started

### Prerequisites

* Node.js 18+
* npm
* MongoDB database

### Installation

Clone the repository:

```bash
git clone https://github.com/wasem7112011/Service-Booking-System-Backend.git
```

Navigate to the project:

```bash
cd Service-Booking-System-Backend
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file using `.env.example` as a reference.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

Use the exact variable names provided by the project's `.env.example`.

### Development

Start the development server with Nodemon:

```bash
npm run dev
```

### Production Build

Compile the TypeScript source:

```bash
npm run build
```

Start the compiled server:

```bash
npm start
```

### Seed Database

If database seed data is required:

```bash
npm run seed
```

## 🔗 Frontend

This backend is used by the separate Next.js frontend.

**Frontend Repository:**
https://github.com/wasem7112011/Service-Booking-System

**Live Frontend:**
https://service-booking-system-tau.vercel.app/

## 📌 Technical Highlights

* RESTful API architecture
* TypeScript backend
* JWT-based authentication
* MongoDB/Mongoose data modeling
* Booking availability validation
* Duplicate booking prevention
* Password hashing with bcrypt
* Rate limiting and security headers
* Separate frontend/backend architecture
* Development and production build scripts
