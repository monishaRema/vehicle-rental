import express, { Request, Response } from "express"
import { initDB } from "./config/db";
import { sendError, sendSuccess } from "./lib/helpers";
import authRouter from "./modules/auth/auth.route";
import vehicelsRouter from "./modules/vehicles/vehicles.route";
import bookingsRouter from "./modules/bookings/bookings.route";
import usersRouter from "./modules/users/users.route";
import bookingsService from "./modules/bookings/bookings.service";
const app = express();


app.use(express.json());

 
// Root route
app.get("/",(req:Request,res:Response) =>{
    sendSuccess(res,"Welcome to Vehicle Rental System",200)
})


// Auth route
app.use("/api/v1/auth", authRouter);

// User route
app.use("/api/v1/users",usersRouter);

// Vehicles route
app.use("/api/v1/vehicles",vehicelsRouter);

// Bookings route
app.use("/api/v1/bookings",bookingsRouter);



// check every day if any booking rent_end_date is expired
const startAutoReturnJob = () => {
//   every day
  const INTERVAL_MS = 24 * 60 * 60 * 1000;

  setInterval(async () => {
     await bookingsService.autoReturnOnBookingEndService();
  }, INTERVAL_MS);
};


const bootstrap = async () => {
    await initDB();
    startAutoReturnJob()
};

bootstrap();





// not found route

app.use(async(req:Request,res:Response) =>{
    sendError(res,`No route found on ${req.path}`,404)
})



export default app;