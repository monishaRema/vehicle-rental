import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../lib/helpers";
import authService from "./auth.service";

const userSignup = async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  // basic validation
  const error: string[] = [];

  if (!name) error.push("name is required");
  if (!email) error.push("email is required");
  if (!phone) error.push("phone is required");
  if (!password || password.length < 6)
    error.push("password is required and must be at least 6 characters");

  if (error.length > 0) {
    return sendError(res, "Missing required fields", 400, { error });
  }

  try {
    // make email lowercase
    const lowercasedEmail = email.trim().toLowerCase();
    // Check user email exist or not
    const user = await authService.getUserByEmail(lowercasedEmail);

    if (user.rowCount !== 0) {
      return sendError(res, "You already have an account with this email", 400);
    }

    // check user role within (admin/customer)
    const allowedRoles = ["admin", "customer"] as const;
    const userRole = role && allowedRoles.includes(role) ? role : "customer";

    const result = await authService.userSignupService(
      name,
      lowercasedEmail,
      password,
      phone,
      userRole
    );
    if (result.rowCount === 0) {
      return sendError(
        res,
        "Internal server error occurred while creating the user.",
        500
      );
    }

    return sendSuccess(
      res,
      "User registered successfully",
      201,
      result.rows[0]
    );
  } catch (err: any) {
    return sendError(
      res,
      "Unexpected server error occurred during signup.",
      500
    );
  }
};

const userSignIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required to signin", 400);
  }

  try {
    const lowercasedEmail = email.trim().toLowerCase();

    const result = await authService.userSignInService(
      lowercasedEmail,
      password
    );

    if (result.status === 401) {
      return sendError(res, result.message, result.status);
    } else if (result.status === 403) {
      return sendError(res, result.message, result.status);
    } else if (result.status === 200) {
      return sendSuccess(res, result.message, result.status, result.data);
    } else {
      return sendError(
        res,
        "Unexpected server error occurred during signin.",
        500
      );
    }
  } catch (error: any) {
    return sendError(
      res,
      "Unexpected server error occurred during signin.",
      500
    );
  }
};

const authController = {
  userSignup,
  userSignIn,
};

export default authController;
