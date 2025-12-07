import { Router } from "express";
import auth from "../../middleware/auth";
import bookingController from "./bookings.controller";

const bookingsRouter = Router();

// Default route => /api/v1/bookings

// POST: /api/v1/bookings =>  create booking - admin or customer only route
bookingsRouter.post("/", auth("admin", "customer"), bookingController.createBooking );

// GET: /api/v1/bookings =>  get all bookings - admin or customer only route
bookingsRouter.get("/", auth("admin", "customer"), bookingController.getBookings );

// GET: /api/v1/bookings/:bookingId =>  get single booking - admin or customer only route
bookingsRouter.get("/:bookingId", auth("admin", "customer"), bookingController.getBookingById );




export default bookingsRouter;