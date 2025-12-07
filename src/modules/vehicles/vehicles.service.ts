import { db } from "../../config/db";
import { CreateVehiclePayload } from "../../types/db";

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
      data: result.rows[0],
    };
  } catch (err: any) {
    console.log(err.message)
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

const vehiclesService = {
  getAllVehicelsService,
  getVehicelByIdService,
  createVehicelsService,
};

export default vehiclesService;
