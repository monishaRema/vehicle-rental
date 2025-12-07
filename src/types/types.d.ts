
type userRole = "customer" | "admin"

export type VehicleType = "car" | "bike" | "van" | "SUV";

export interface AuthUser {
  id: number;
  role: userRole;
}

export interface SignupData {
  name: string,
  email: string,
  password: string,
  phone: string,
  role: userRole
}


export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: string; 
}

export interface CreateVehiclePayload {
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status: string;
}


export interface CreateBookingInput {
  customerId: number;
  vehicleId: number;
  rentStartDate: string; 
  rentEndDate: string; 
}
