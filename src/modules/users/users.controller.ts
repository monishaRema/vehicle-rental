import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../lib/helpers";
import userService from "./users.service";
import { UpdateUserPayload } from "../../types/types";

const getAllUsers = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return sendError(res, "Unauthorized access, admin only route", 403);
  }

  try {
    const result = await userService.getAllUserService();

    if (result.rowCount === 0) {
      return sendSuccess(res, "No user found", 200, result.rows);;
    }

    return sendSuccess(res, "Users retrieved successfully", 200, result.rows);
  } catch (err: any) {
    return sendError(res, "Unexpected server error while fetching users", 500);
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, email, phone, role } = req.body || {};

  const authUser = req.user; 

  const targetId = Number(userId);

  if (isNaN(targetId)) {
    return sendError(res, "Invalid user id", 400);
  }

  if (!authUser) {
    return sendError(res, "Unauthorized access", 401);
  }

  //  Admin or Owner check
  const isAdmin = authUser.role === "admin";
  const isSelf = authUser.id === targetId;

  if (!isAdmin && !isSelf) {
    return sendError(
      res,
      "you can only update your own profile",
      403
    );
  }

  //Only admin can change the role
  let finalRole: string | undefined = undefined;

  if (isAdmin && role) {
    finalRole = role; 
  }

  // Lower case the email if provided
   
    const lowerCaseEmail = email ? email.trim().toLowerCase() : null;
    const updatePhone = phone ? phone.trim() : null;
    const updateName = name ? name.trim() : null;
  
  

  try {
    // check user exists
    const existing = await userService.getUserById(targetId);
    if (existing.rowCount === 0) {
      return sendError(res, "User not found", 404);
    }

    const payload: UpdateUserPayload = {
    name:updateName as string,
    email: lowerCaseEmail as string,
    phone:updatePhone as string,
    role: finalRole as string,
  };
    const result = await userService.updateUserService(targetId, payload) ;

    if (result.rowCount === 0) {
      return sendError(
        res,
        "Failed to update user. Please try again later.",
        500
      );
    }

    
    return sendSuccess(res, "User updated successfully", 200, {...result.rows[0]});
  } catch (err: any) {
    console.error("Update user error:", err);
    return sendError(
      res,
      "Unexpected server error while updating user",
      500
    );
  }
};


const deleteUser = async (req: Request, res: Response) => {

  if (req.user?.role !== "admin") {
    return sendError(res, "Unauthorized access, admin only route", 403);
  }

  const { userId } = req.params;
  const targetId = Number(userId);

  if (isNaN(targetId) || targetId <= 0) {
    return sendError(res, "Invalid user id", 400);
  }

  try {
    const result = await userService.deleteUserService(targetId);

    if (result.status === 200) {
      return sendSuccess(res, result.message, 200);
    }

    return sendError(res, result.message, result.status);
  } catch (err: any) {
    console.error("Unexpected error while deleting user:", err);
    return sendError(res, "Unexpected server error while deleting user", 500);
  }
};

const usersController = {
  getAllUsers,
  updateUser,
  deleteUser
};

export default usersController;
