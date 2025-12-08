import { db } from "../../config/db";
import { CreateVehiclePayload, UpdateVehiclePayload } from "../../types/types";

const createVehicelsService = async (
  payload: CreateVehiclePayload
): Promise<any> => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  try {
    // check the vehicle is already registered
    const existing = await db.query(
      `SELECT id FROM vehicles WHERE registration_number = $1`,
      [registration_number]
    );

    if (existing.rowCount !== 0) {
      return {
        status: 409,
        message: `The vehicle with this registration_number '${registration_number}' already exist`,
      };
    }

    const result = await db.query(
      `INSERT INTO vehicles 
       (vehicle_name, type, registration_number, daily_rent_price, availability_status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
      `,
      [
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status,
      ]
    );

    if (result.rowCount === 0) {
      return {
        status: 500,
        message: "unexpected error while registering new vehicle",
      };
    }

    return {
      status: 200,
      message: "Vehicle created successfully",
      data: {
        ...result.rows[0],
        daily_rent_price:Number(result.rows[0].daily_rent_price)
      },
    };
  } catch (err: any) {
    console.log(err.message);
    return {
      status: 500,
      message: "Database error while creating vehicle. Please try again later.",
    };
  }
};

const getAllVehicelsService = async () => {
  return await db.query(`SELECT * FROM vehicles`);
};

const getVehicelByIdService = async (vehicleId: number) => {
  return await db.query(`SELECT * FROM vehicles WHERE id = $1`, [vehicleId]);
};

const getVehicelByRegNumberService = async (regNumber: string) => {
  return await db.query(`SELECT * FROM vehicles WHERE  registration_number = $1`, [regNumber]);
};

const deleteVehicleService = async (vehicleId: number) => {
  const existingVehicles = await getVehicelByIdService(vehicleId);

  if (existingVehicles.rowCount === 0) {
    return {
      status: 404,
      message: `No vehicle found with this id no ${vehicleId} `,
    };
  }

  const existingBooking = await db.query(
    `
      SELECT 1 
      FROM bookings 
      WHERE 
        vehicle_id = $1 
        AND status = 'active'
      LIMIT 1
    `,
    [vehicleId]
  );

  if (existingBooking.rowCount !== 0) {
    return {
      status: 409,
      message:
        "Vehicle has active bookings and cannot be deleted. Please cancel or complete the bookings first.",
    };
  }

  const result = await db.query(`DELETE FROM vehicles WHERE id = $1`, [
    vehicleId,
  ]);

  if (result.rowCount === 0) {
    return {
      status: 500,
      message: "Database error to delete the vehicle",
    };
  }
  return {
    status: 200,
    message: "Vehicle deleted successfully",
  };
};

const updateVehicleService = async (
  vehicleId: number,
  payload: UpdateVehiclePayload
) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  try {

    const checkUniqueRegNumber = await getVehicelByRegNumberService(registration_number as string);

    if(checkUniqueRegNumber.rowCount !== 0) {
      return {
      status: 500,
      message: "Registration number must be unique : please use different registration number",
    };
    }

    const result = await db.query(
      `UPDATE vehicles 
     SET 
      vehicle_name        = COALESCE($1, vehicle_name), 
      type                = COALESCE($2, type), 
      registration_number = COALESCE($3, registration_number),
      daily_rent_price    = COALESCE($4,daily_rent_price), 
      availability_status = COALESCE($5, availability_status),
      updated_at          = NOW()
     WHERE id=$6
     RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
    `,
      [
        vehicle_name ?? null,
        type,
        registration_number ?? null,
        daily_rent_price ?? null,
        availability_status ?? null,
        vehicleId,
      ]
    );

    if (result.rowCount === 0) {
      return {
        status: 500,
        message: "Failed to update vehicle. Please try again later.",
      };
    }

    return {
      status: 200,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    };
  } catch (err: any) {
    return {
      status: 500,
      message: "Database error while updating vehicle. Please try again later.",
    };
  }
};
const vehiclesService = {
  getAllVehicelsService,
  getVehicelByIdService,
  createVehicelsService,
  deleteVehicleService,
  updateVehicleService,
  getVehicelByRegNumberService
};

export default vehiclesService;
