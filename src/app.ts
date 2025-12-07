import express, { Request, Response } from "express"
import { initDB } from "./config/db";
import { sendError, sendSuccess } from "./lib/helpers";
import authRouter from "./modules/auth/auth.route";
import vehicelsRouter from "./modules/vehicles/vehicles.route";
import bookingsRouter from "./modules/bookings/bookings.route";
import usersRouter from "./modules/users/users.route";
const app = express();


app.use(express.json());
initDB();



app.get("/",(req:Request,res:Response) =>{
    sendSuccess(res,"Welcome to Vehicle Rental System",200)
})


// Auth route


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users",usersRouter);
// app.use("/api/v1/vehicles",vehicelsRouter);
// app.use("/api/v1/bookings",bookingsRouter);



// not found route

app.use(async(req:Request,res:Response) =>{
    sendError(res,`No route found on ${req.path}`,404)
})



export default app;