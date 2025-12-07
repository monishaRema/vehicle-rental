import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../lib/helpers";
import bookingsService from "./bookings.service";
import { AuthUser } from "../../types/types";

const createBooking = async (req: Request, res: Response) => {
  const authUser = req.user as AuthUser | undefined;

  if (!authUser) {
    return sendError(res, "Unauthorized", 401);
  }

  try {
    const { vehicle_id, rent_start_date, rent_end_date, customer_id } =
      req.body;

    if (!vehicle_id || !rent_start_date || !rent_end_date) {
      return sendError(
        res,
        "vehicle_id, rent_start_date and rent_end_date are required",
        400
      );
    }

    // customer ID based on role
    let finalCustomerId: number;

    if (authUser.role === "customer") {
      // customer cannot provide customer_id we extract it from token
      finalCustomerId = authUser.id;
    } else {
      // admin
      if (!customer_id) {
        return sendError(
          res,
          "customer_id is required when booking as admin",
          400
        );
      }

      finalCustomerId = Number(customer_id);
      if (Number.isNaN(finalCustomerId)) {
        return sendError(res, "customer_id must be a valid number", 400);
      }
    }

    const finalVehicleId = Number(vehicle_id);
    if (Number.isNaN(finalVehicleId)) {
      return sendError(res, "vehicle_id must be a valid number", 400);
    }

    const result = await bookingsService.createBookingsService({
      customerId: finalCustomerId,
      vehicleId: finalVehicleId,
      rentStartDate: rent_start_date,
      rentEndDate: rent_end_date,
    });

    if (result.status === 200) {
      return sendSuccess(res, result.message, result.status, result.data);
    } else {
      return sendError(res, result.message, result.status);
    }
  } catch (err: any) {
    console.log(err);
    return sendError(
      res,
      "Unexpected server error while creating new bookings",
      500
    );
  }
};

const getBookings = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, "Unauthorized access", 401);
  }

  const role = req.user.role;
  const id = req.user.id;

  if (!["admin", "customer"].includes(role)) {
    return sendError(res, "Invalid user role", 403);
  }

  try {
    const result = await bookingsService.getAllBookingsService({id,role,});

    if (result.status >= 400) {
      return sendError(res, result.message, result.status);
    }

    const data = result.data || [];

    if (data.length === 0) {
      const msg = role === "admin"? "No bookings found" : "You don't have any bookings yet";
      return sendSuccess(res, msg, 200, []);
    }

    const msg = role === "admin"? "Bookings retrieved successfully" : "Your bookings retrieved successfully";

    return sendSuccess(res, msg, 200, data);

  } catch (err: any) {
    return sendError(
      res,
      "Unexpected server error while fetching bookings",
      500
    );
  }
};



const getBookingById = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  const targetId = Number(bookingId);

  if (isNaN(targetId)) {
    return sendError(res, "Invalid booking id", 400);
  }

  try {
    const result = await bookingsService.getBookingByIdService(targetId);

    if (result.rowCount === 0) {
      return sendSuccess(res, "No booking found", 200);
    }

    return sendSuccess(res, "successfully get all bookings", 200);
  } catch (err: any) {
    return sendError(
      res,
      "Unexpected server error while fetching bookings",
      500
    );
  }
};

const bookingController = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
};
export default bookingController;
