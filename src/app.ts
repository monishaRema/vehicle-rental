import express from "express"
import { initDB } from "./config/db";
const app = express();


app.use(express.json());
initDB();

export default app;