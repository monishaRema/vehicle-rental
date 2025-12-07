import { Router } from "express";
import auth from "../../middleware/auth";
import vehiclesController from "./vehicles.controller";

const vehicelsRouter = Router();
//  Default route  /api/v1/vehicles



// POST: /api/v1/vehicles =>  create vehicles - admin only route
vehicelsRouter.post("/", auth("admin"), vehiclesController.createVehicels);



// GET: /api/v1/vehicles =>  get vehicles - public
vehicelsRouter.get("/", vehiclesController.getAllVehicles);


// GET: /api/v1/vehicles/:vehicleId =>  get sepecefic vehicles - public
vehicelsRouter.get("/:vehicleId", vehiclesController.getVehicleById);


// PUT : /api/v1/vehicles/:vehicleId => Update vehicles - admin only
vehicelsRouter.put(
  "/:vehicleId",
  auth("admin"),
  vehiclesController.updateVehicle
);


// DELETE : /api/v1/vehicles/:vehicleId => Delete vehicles - admin only - if no active bookings

vehicelsRouter.delete(
  "/:vehicleId",
  auth("admin"),
  vehiclesController.deleteVehicle
);

export default vehicelsRouter;
