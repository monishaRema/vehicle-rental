import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../lib/helpers";
import config from "../config";


// Middleware roles: "admin", "customer".

const auth = (...roles: string[]) => {

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check token in header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return sendError(res, "Authentication token missing", 401);
      }

      // get the token
      const token = authHeader.split(" ")[1];

      // check token validity
      const decoded = jwt.verify(
        token as string,
        config.jwt_secrete as string
      ) as JwtPayload;

      // add user to req
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };

      // Role checking (if given as param)
      if (roles.length > 0) {
        const userRole = decoded.role as string;

        if (!roles.includes(userRole)) {
          return sendError(res, "Access denied.", 403);
        }
      }

      next();
    } catch (err: any) {
      return sendError(res, "Invalid or expired token", 401);
    }
  };
};

export default auth;
