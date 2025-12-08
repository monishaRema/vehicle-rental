# Vehicle Rental API

A clean, modular, and production-ready REST API for managing vehicle rentals — including user authentication, vehicle inventory, booking lifecycle, and role-based authorization.
<a herf="https://vehicle-rental-kg5ha9eq0-monisha-remas-projects.vercel.app/  ">Live API Root</a>


<a herf="https://github.com/monishaRema/vehicle-rental/  ">GitHub Repository</a> 

---

## Features

- **Authentication & Authorization**
  - Secure user registration and login
  - Password hashing with bcrypt
  - JWT-based authentication
  - Role-based access control (`admin`, `customer`)

- **Users Module**
  - Admin-level user listing & management
  - Self-service profile updates for customers
  - Safe validation & error handling for updates

- **Vehicles Module**
  - Public: list all vehicles, view single vehicle
  - Admin-only: create, update, delete
  - Availability tracking (`available`, `booked`, `returned`)

- **Bookings Module**
  - Create new booking with pricing logic
  - Prevent double-booking on unavailable vehicles
  - Auto-update vehicle status throughout lifecycle
  - Booking cancellation & return logic
  - Background auto-return job (scheduled)

- **Database**
  - PostgreSQL schema auto-bootstrapped at server start
  - Neon-compatible connection string
  - Clean, strongly typed SQL queries using `pg`

- **Architecture**
  - Fully modular structure (routes → controllers → services → DB)
  - Reusable helper utilities for success/error responses
  - Type-safe code powered by TypeScript

---

## Technology Stack

- **Runtime:** Node.js (Express 5)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon-friendly)
- **Auth:** JWT + bcrypt
- **Environment:** dotenv
- **Dev Tools:** tsx, nodemon

---

##  Setup Instructions

### 1. Prerequisites
- Node.js v18+
- npm or yarn
- A PostgreSQL database connection string

### 2. Install Dependencies
```bash
npm install

```
### 3. Create a `.env` file in the project root:
   ```bash
   JWT_SECRETE=your_jwt_secret
   NEON_DB_STR=postgres_connection_string
   PORT=5000
   ```
### 4. Start the dev server (auto-creates tables defined in `src/config/db.ts`):
   ```bash
   npm run dev
   ```

## Usage
Base URL: `https://vehicle-rental-kg5ha9eq0-monisha-remas-projects.vercel.app/`

Every protected route requires: Authorization: Bearer <jwt_token>

### Auth Endpoints

| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| POST   | /api/v1/auth/signup    | Register a new user   |
| POST   | /api/v1/auth/signin    | Login & receive JWT   |



### User Endpoints
| Method | Endpoint                 | Access        | Description             |
|--------|---------------------------|---------------|-------------------------|
| GET    | /api/v1/users             | Admin         | Get all users           |
| PUT    | /api/v1/users/:userId     | Admin / Owner | Update user profile     |

### Vehicle Endpoints

| Method | Endpoint                   | Access | Description            |
|--------|-----------------------------|--------|------------------------|
| GET    | /api/v1/vehicles            | Public | List all vehicles      |
| GET    | /api/v1/vehicles/:id        | Public | Get a single vehicle   |
| POST   | /api/v1/vehicles            | Admin  | Create a new vehicle   |
| PUT    | /api/v1/vehicles/:id        | Admin  | Update a vehicle       |
| DELETE | /api/v1/vehicles/:id        | Admin  | Delete a vehicle       |

### Booking Endpoints

| Method | Endpoint                        | Access            | Description                               |
|--------|----------------------------------|-------------------|-------------------------------------------|
| POST   | /api/v1/bookings                 | Customer          | Create booking                            |
| GET    | /api/v1/bookings                 | Admin             | Get all bookings                          |
| PUT    | /api/v1/bookings/:id             | Admin / Customer  | Update booking status (cancel/returned)   |


### Response Format

Success
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { }
}
```

Error
```json

{
  "success": false,
  "errors": "Detailed error message"
}
```

## Folder Structure

<pre>
src/
 ├── config/
 │   ├── db.ts
 │   └── index.ts
 │
 ├── lib/
 │   └── middleware/
 │       └── auth.ts
 │
 ├── modules/
 │   ├── auth/
 │   │   ├── auth.controller.ts
 │   │   ├── auth.route.ts
 │   │   └── auth.service.ts
 │   │
 │   ├── bookings/
 │   │   ├── bookings.controller.ts
 │   │   ├── bookings.route.ts
 │   │   └── bookings.service.ts
 │   │
 │   ├── users/
 │   │   ├── users.controller.ts
 │   │   ├── users.route.ts
 │   │   └── users.service.ts
 │   │
 │   └── vehicles/
 │       ├── vehicles.controller.ts
 │       ├── vehicles.route.ts
 │       └── vehicles.service.ts
 │
 ├── types/
 │
 ├── app.ts
 └── server.ts
 └── .env
 └── .gitignore
 └── package.json
 └── package-lock.json
 └── tsconfig.json
 └── vercel.json
</pre>

