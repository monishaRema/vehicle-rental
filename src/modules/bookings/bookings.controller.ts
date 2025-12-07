import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../lib/helpers";
import bookingsService from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
  try {
  } catch (err: any) {
    return sendError(
      res,
      "Unexpected server error while creating new bookings",
      500
    );
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingsService.getAllBookingsService();

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
    getBookingById
};
export default bookingController;
