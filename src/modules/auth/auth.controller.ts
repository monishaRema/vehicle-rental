import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../lib/helpers";
import authService from "./auth.service";

const userSignup = async(req:Request,res:Response) =>{

const { name, email, password, phone } = req.body;

  // basic validation 
  const missing: string[] = [];

  if (!name) missing.push("name is required");
  if (!email) missing.push("email is required");
  if (!password) missing.push("password is required");
  if (!phone) missing.push("phone is required");
  if(password.length > 6) missing.push("password must be more than 6 char")
  if (email !== email.toLowerCase()) missing.push("Email must be in lowercase");


  if (missing.length > 0) {
    return  sendError(res,"Missing required fields",400)
  }

    try {

        const result = await authService.userSignupService(req.body);

        if(result){
            sendSuccess(res,"User registered successfully",201,result.rows[0])
        }

        
    } catch (err:any) {
        sendError(res,"Unexpected server errors on signup",500)
    }
    
}


const authController = {

}

export default authController;