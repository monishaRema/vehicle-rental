import { db } from "../../config/db";
import { formatDate } from "../../lib/helpers";
import { AuthUser, CreateBookingInput } from "../../types/types";

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

  if (vehicle.availability_status === "booked") {
    return {
      status: 400,
      message: "Your targeted vehicle is already booked",
    };
  }

  // Calculate total price
  const totalPrice = Number(vehicle.daily_rent_price * durationDays);

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
        total_price: Number(result.rows[0].total_price),

        vehicle: {
          vehicle_name: vehicle?.vehicle_name,
          daily_rent_price: Number(vehicle?.daily_rent_price),
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

const getAllBookingsService = async (params: AuthUser) => {
  const { id, role } = params;

  try {
    if (role === "admin") {
      const result = await db.query(
        `
        SELECT
          b.id,
          b.customer_id,
          b.vehicle_id,
          b.rent_start_date,
          b.rent_end_date,
          b.total_price,
          b.status,
          u.name  AS customer_name,
          u.email AS customer_email,
          v.vehicle_name,
          v.registration_number
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        JOIN vehicles v ON b.vehicle_id = v.id
        
        `
      );

      const bookings = result.rows.map((row) => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: formatDate(row.rent_start_date),
        rent_end_date: formatDate(row.rent_end_date),
        total_price: Number(row.total_price),
        status: row.status,
        customer: {
          name: row.customer_name,
          email: row.customer_email,
        },
        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
        },
      }));

      return {
        status: 200,
        message: "Bookings fetched",
        data: bookings,
      };
    }

    // Customer only view own bookings
    const result = await db.query(
      `
      SELECT
        b.id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        v.vehicle_name,
        v.registration_number,
        v.type AS vehicle_type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      `,
      [id]
    );

    const bookings = result.rows.map((row) => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: formatDate(row.rent_start_date),
      rent_end_date: formatDate(row.rent_end_date),
      total_price: Number(row.total_price),
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.vehicle_type,
      },
    }));

    return {
      status: 200,
      message: "User bookings fetched",
      data: bookings,
    };
  } catch (err: any) {
    console.error("DB error in getAllBookingsService:", err);
    return {
      status: 500,
      message: "Database error while fetching bookings",
    };
  }
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




const updateVehicleToAvaible = async (vehicleId: number) => {
  try {
    const result = await db.query(
      `
        UPDATE vehicles
            SET availability_status = 'available'
        WHERE id = $1
      
      `,
      [vehicleId]
    );

    if (result.rowCount === 0) {
      return {
        status: 500,
        message: "Unexpected database error while updating vehicle",
      };
    }

    return {
      status: 200,
      message: "Vehicle updated to available",
    };
  } catch (err: any) {
    return {
      status: 500,
      message: "Unexpected database error while updating vehicle",
    };
  }
};

// for admin only
const markBookingReturnedService = async (bookingId: number) => {
  try {
    const result = await db.query(
      `
        UPDATE bookings
        SET 
          status = 'returned'
        WHERE id = $1
        RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
      `,
      [bookingId]
    );

    if (result.rowCount === 0) {
      return {
        status: 500,
        message: "Failed to mark the booking as returned",
      };
    }

    const booking = result.rows[0];

    // Make the vehicle available
    const updateVehicle = await updateVehicleToAvaible(booking.vehicle_id);

    if (updateVehicle.status !== 200) {
      return {
        status: updateVehicle.status,
        message: updateVehicle.message,
      };
    }

    return {
      status: 200,
      message: "Booking marked as returned. Vehicle is now available",
      data: {
        ...booking,
        rent_start_date: formatDate(booking.rent_start_date),
        rent_end_date: formatDate(booking.rent_end_date),
        total_price: Number(booking.total_price),
        vehicle: {
          availability_status: "available",
        },
      },
    };
  } catch (err: any) {
    return {
      status: 500,
      message: "Unexpected database error while marking booking returned",
    };
  }
};


// for customer only
const cancelBookingService = async (bookingId: number) => {
  try {
    const result = await db.query(
      `
        UPDATE bookings 
        SET 
          status = 'cancelled'
        WHERE id = $1
        RETURNING id,customer_id,vehicle_id,rent_start_date,rent_end_date,total_price,status
      `,
      [bookingId]
    );

    if (result.rowCount === 0) {
      return {
        status: 500,
        message: "Failed to cancel the booking",
      };
    }

    // make targeted  vehicle to availble once booking is cancelled
    const updateVehicle = await updateVehicleToAvaible(
      result.rows[0].vehicle_id
    );

    if (updateVehicle.status !== 200) {
      return {
        status: updateVehicle.status,
        message: updateVehicle.message,
      };
    }

    return {
      status: 200,
      message: "Booking cancelled successfully",
      data: {
        ...result.rows[0],
        rent_start_date: formatDate(result.rows[0]?.rent_start_date),
        rent_end_date: formatDate(result.rows[0]?.rent_end_date),
        total_price: Number(result.rows[0].total_price),
      },
    };
  } catch (err: any) {
    return {
      status: 500,
      message: "Unexpected databse error",
    };
  }
};

const bookingsService = {
  getAllBookingsService,
  getBookingByIdService,
  createBookingsService,
  getVehicleAvailablityById,
  cancelBookingService,
  updateVehicleToAvaible,
  markBookingReturnedService,
};

export default bookingsService;
