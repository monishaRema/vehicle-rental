import { Router } from "express";
import authController from "./auth.controller";

const authRouter = Router();
// Root route 
// /api/v1/auth

//POST: Signup route => /api/v1/auth/signup => public route

authRouter.post("/signup" , authController.userSignup)
//POST: Signin route => /api/v1/auth/signin => public route




export default authRouter;