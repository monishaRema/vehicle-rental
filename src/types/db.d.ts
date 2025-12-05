
type userRole = "customer" | "admin"

export interface SignupData {
  name: string,
  email: string,
  password: string,
  phone: string,
  role: userRole
}