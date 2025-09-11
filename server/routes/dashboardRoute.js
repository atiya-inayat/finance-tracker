import express from "express";

import { getDashboardData } from "../controllers/transactionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const route = express.Router();

route.get("/dashboard", authMiddleware, getDashboardData);

export default route;
