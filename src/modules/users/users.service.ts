import { db } from "../../config/db";
import { UpdateUserPayload } from "../../types/types";

const getUserById = async (userId: number) => {
  return db.query(
    `SELECT id, name, email, phone, role, created_at 
     FROM users 
     WHERE id = $1`,
    [userId]
  );
};

const getUserByEmail = async (email: string) => {
  return db.query(
    `SELECT name, email
     FROM users 
     WHERE email = $1`,
    [email]
  );
};

const getAllUserService = async () => {
  return db.query(
    `SELECT id, name, email, phone, role, created_at, updated_at 
     FROM users
     ORDER BY id ASC`
  );
};

const updateUserService = async (
  userId: number,
  payload: UpdateUserPayload
) => {
  const { name, email, phone, role } = payload;

  try {
    if (email !== null && email !== undefined) {
      const checkEmailExists = await getUserByEmail(email);
      if (checkEmailExists.rowCount !== 0) {
        return {
          status: 409,
          message: `Email - ${email} already in use by another user`,
        };
      }
    }

    const result = await db.query(
      `UPDATE users
     SET
       name       = COALESCE($2, name),
       email      = COALESCE($3, email),
       phone      = COALESCE($4, phone),
       role       = COALESCE($5, role),
       updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, phone, role`,
      [userId, name ?? null, email ?? null, phone ?? null, role ?? null]
    );

    if (result.rowCount === 0) {
      return {
        status: 500,
        message: "Failed to update user",
      };
    }
    return {
      status: 200,
      message: "User updated successfully",
      data: result.rows[0],
    };
  } catch (error: any) {
    return {
      status: 500,
      message:
        "Unexpected database error while updating user. Please try again later.",
    };
  }
};

const deleteUserService = async (userId: number) => {
  try {
    // Check user exists
    const userResult = await db.query(`SELECT id FROM users WHERE id = $1`, [
      userId,
    ]);

    if (userResult.rowCount === 0) {
      return {
        status: 404,
        message: `No user found with id ${userId}`,
      };
    }

    // Check active bookings for this user
    const activeBookings = await db.query(
      `
      SELECT 1 
      FROM bookings 
      WHERE customer_id = $1 
        AND status = 'active'
      LIMIT 1
      `,
      [userId]
    );

    if (activeBookings.rowCount !== 0) {
      return {
        status: 409,
        message:
          "User has active bookings and cannot be deleted. Please cancel or complete the bookings first.",
      };
    }

    // delete user
    const deleteResult = await db.query(`DELETE FROM users WHERE id = $1`, [
      userId,
    ]);

    if (deleteResult.rowCount === 0) {
      return {
        status: 500,
        message: "Unexpected error while deleting user",
      };
    }

    return {
      status: 200,
      message: "User deleted successfully",
    };
  } catch (err: any) {
    return {
      status: 500,
      message: "Database error while deleting user. Please try again later.",
    };
  }
};

const userService = {
  getAllUserService,
  getUserById,
  updateUserService,
  deleteUserService,
  getUserByEmail,
};
export default userService;
