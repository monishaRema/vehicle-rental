import { db } from "../../config/db";
import { UpdateUserPayload } from "../../types/db";

const getUserById = async (userId: number) => {
  return db.query(
    `SELECT id, name, email, phone, role, created_at 
     FROM users 
     WHERE id = $1`,
    [userId]
  );
};

const getAllUserService = async() => {
  return db.query(
    `SELECT id, name, email, phone, role, created_at, updated_at 
     FROM users
     ORDER BY id ASC`
  );
}





const updateUserService = async (userId: number, payload: UpdateUserPayload) => {
  const { name, email, phone, role } = payload;

  
 const result = await db.query(
    `UPDATE users
     SET
       name       = COALESCE($2, name),
       email      = COALESCE($3, email),
       phone      = COALESCE($4, phone),
       role       = COALESCE($5, role),
       updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, phone, role,updated_at`,
    [
      userId,
      name ?? null,
      email ?? null,
      phone ?? null,
      role ?? null,
    ]
  );

  return result;
};



const userService = {

    getAllUserService,
    getUserById,
    updateUserService

}
export default userService;