
type userRole = "customer" | "admin"

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