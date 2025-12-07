import { db } from "../../config/db";
import { formatDate } from "../../lib/helpers";
import { CreateBookingInput } from "../../types/types";

const createBookingsService = async (payload: CreateBookingInput) => {
  const { customerId, vehicleId, rentStartDate, rentEndDate } = payload;

  // Check end date is not before start date
  const start = new Date(rentStartDate);
  const end = new Date(rentEndDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      status: 400,
      message: "Invalid rent_start_date or rent_end_date",
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const durationDays = Math.ceil((end.getTime() - start.getTime()) / msPerDay);

  if (durationDays <= 0) {
    return {
      status: 400,
      message: "rent_end_date must be after rent_start_date",
    };
  }

  const vehicleData = await getVehicleAvailablityById(vehicleId);
  if (vehicleData.rowCount === 0) {
    return {
      status: 400,
      message: `No vehicle found with this id ${vehicleId}`,
    };
  }
  const vehicle = vehicleData.rows[0];
  console.log(vehicle, vehicleData);
  if (vehicle.availability_status === "booked") {
    return {
      status: 400,
      message: "Your targeted vehicle is already booked",
    };
  }

  // Calculate total price
  const totalPrice = vehicle.daily_rent_price * durationDays;

  try {
    const result = await db.query(
      `
                INSERT INTO bookings
                (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
                VALUES($1, $2, $3, $4, $5, $6)
                RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date,total_price,status
            `,
      [customerId, vehicleId, rentStartDate, rentEndDate, totalPrice, "active"]
    );

    if (result.rowCount === 0) {
      return {
        status: 500,
        message: "Booking failed",
      };
    }

    const updateVehicle = await db.query(
      `
            UPDATE vehicles
            SET 
                availability_status = $2
            WHERE id = $1
        `,
      [vehicleId, "booked"]
    );

    if (updateVehicle.rowCount === 0) {
      return {
        status: 500,
        message: "Booking failed: vehicle update failed",
      };
    }

    return {
      status: 200,
      message: "Booking created successfully",
      data: {
        ...result.rows[0],
        rent_start_date: formatDate(result.rows[0].rent_start_date),
        rent_end_date: formatDate(result.rows[0].rent_end_date),
        vehicle: {
          vehicle_name: vehicle?.vehicle_name,
          daily_rent_price: vehicle?.daily_rent_price,
        },
      },
    };
  } catch (err: any) {
    return {
      status: 500,
      message: "Database error while making booking",
    };
  }
};

const getAllBookingsService = async () => {
  return await db.query(`SELECT * FROM bookings`);
};

const getBookingByIdService = async (bookingId: number) => {
  return await db.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
};

const getVehicleAvailablityById = async (vehicleId: number) => {
  return await db.query(
    `SELECT vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id = $1`,
    [vehicleId]
  );
};

const bookingsService = {
  getAllBookingsService,
  getBookingByIdService,
  createBookingsService,
  getVehicleAvailablityById,
};

export default bookingsService;
