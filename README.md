# Vehicle Rental API

Live URL: Not deployed yet (update when available)

## Features
- User registration and login with hashed passwords and JWT issuance.
- Role-based authorization (admin/customer) via middleware for protected routes.
- Vehicle management endpoints for listing, details, and admin-only create/update/delete.
- User management for admins plus self-service profile updates.
- Booking routes scaffolded with role protections (enable in `src/app.ts` when ready).
- PostgreSQL schema bootstrapped automatically on server start.

## Technology Stack
- Node.js + Express 5
- TypeScript
- PostgreSQL (Neon friendly) via `pg`
- JWT auth with `jsonwebtoken` and `bcryptjs`
- Environment config with `dotenv`
- Dev runtime with `tsx`

## Setup
1. Prerequisites: Node 18+, npm, and a PostgreSQL connection string.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root:
   ```bash
   JWT_SECRETE=your_jwt_secret
   NEON_DB_STR=postgres_connection_string
   PORT=5000
   ```
4. Start the dev server (auto-creates tables defined in `src/config/db.ts`):
   ```bash
   npm run dev
   ```

## Usage
Base URL: `http://localhost:5000`

- `POST /api/v1/auth/signup` — register (name, email, password, phone, role?).
- `POST /api/v1/auth/signin` — login, returns JWT.
- `GET /api/v1/users` — admin only; send `Authorization: Bearer <token>`.
- `PUT /api/v1/users/:userId` — admin or owner can update profile fields.
- `POST /api/v1/vehicles` — admin only; create vehicle (controller logic in progress).
- `GET /api/v1/vehicles` — list vehicles; `GET /api/v1/vehicles/:vehicleId` — get one.
- `PUT /api/v1/vehicles/:vehicleId` and `DELETE ...` — admin only.
- Booking endpoints are defined in `src/modules/bookings` and can be mounted by uncommenting the route in `src/app.ts`.

All JSON responses use the helper format `{ success, message|errors, data }`. Include the Bearer token on protected routes.
