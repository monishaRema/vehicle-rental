import { Router } from "express";
import usersController from "./users.controller";
import auth from "../../middleware/auth";

const usersRouter = Router();

// Default Route => /api/v1/users


// GET => /api/v1/users => get all users - admin only route
usersRouter.get("/", auth("admin"), usersController.getAllUsers)

// PUT => /api/v1/users/:userId => Update user - admin and owner only route
usersRouter.put("/:userId", auth("admin", "customer"), usersController.updateUser)


// DELETE => /api/v1/users => delete user if no active booking - admin only route
usersRouter.delete("/", auth("admin"), usersController.deleteUser)


export default usersRouter;