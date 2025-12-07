import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../lib/helpers";
import vehiclesService from "./vehicles.service";
import { CreateVehiclePayload } from "../../types/types";

const createVehicels = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return sendError(res, "Only admin can register new vehicle", 403);
  }

  try {
    const {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    } = req.body;

    const errors: string[] = [];

    if (!vehicle_name) errors.push("vehicle_name is required");
    if (!type) errors.push("type is required");
    if (!registration_number) errors.push("registration_number is required");

    if (daily_rent_price === undefined || daily_rent_price === null) {
      errors.push("daily_rent_price is required");
    } else if (typeof daily_rent_price !== "number" || daily_rent_price <= 0) {
      errors.push("daily_rent_price must be a positive number");
    }

    const allowedTypes = ["car", "bike", "van", "SUV"];
    if (type && !allowedTypes.includes(type))
      errors.push("type must be within car, bike, van or SUV");

    const allowedStatus = ["available", "booked"];
    if (availability_status && !allowedStatus.includes(availability_status))
      errors.push("availability_status must be: available or booked");

    if (errors.length > 0) {
      return sendError(res, "Invalid input data", 400, { errors });
    }

    let checkedAvailability_status: string = availability_status
      ? availability_status
      : "available";

    const vehicalPayload: CreateVehiclePayload = {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status: checkedAvailability_status,
    };

    const result = await vehiclesService.createVehicelsService(vehicalPayload);

    if (result.status !== 200) {
      return sendError(res, result.message, result.status);
    }

    return sendSuccess(res, "Vehicle created successfully", 201, result.data);
  } catch (err: any) {
    console.log(err.message);
    return sendError(
      res,
      "Unexpected server error while creating vehicles",
      500
    );
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehiclesService.getAllVehicelsService();

    if (result.rowCount === 0) {
      return sendSuccess(res, "No vehicle found", 200, [...result.rows]);
    }
    return sendSuccess(
      res,
      "Vehicles retrieved successfully",
      200,
      result?.rows
    );
  } catch (err: any) {
    return sendError(
      res,
      "Unexpected server error while fetching vehicles",
      500
    );
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const targetId = Number(vehicleId);

  if (isNaN(targetId)) {
    return sendError(res, "Invalid user id", 400);
  }

  try {
    const result = await vehiclesService.getVehicelByIdService(targetId);

    if (result.rowCount === 0) {
    }
    sendSuccess(res, "Vehicle retrieved successfully", 200, result?.rows[0]);
  } catch (err: any) {
    return sendError(
      res,
      "Unexpected server error while fetching single vehicle",
      500
    );
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return sendError(
      res,
      "Unauthorized access, only admin can update vehicle",
      403
    );
  }

  try {
  } catch (err: any) {
    return sendError(
      res,
      "Unexpected server error while fetching single vehicle",
      500
    );
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return sendError(
      res,
      "Unauthorized access, only admin can delete vehicle",
      403
    );
  }

  const { vehicleId } = req.params;
  const id = Number(vehicleId);

  if (!vehicleId && isNaN(id)) {
    sendError(res, "Vehicle id must be a number", 400);
  }

  try {
    const result = await vehiclesService.deleteVehicleService(id);

    if (result.status === 200) {
      sendSuccess(res, result.message, result.status);
    } else {
      sendError(res, result.message, result.status);
    }
  } catch (err: any) {
    return sendError(
      res,
      "Unexpected server error while fetching single vehicle",
      500
    );
  }
};

const vehiclesController = {
  createVehicels,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};

export default vehiclesController;
