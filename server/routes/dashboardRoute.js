import express from "express";

import { getDashboardData } from "../controllers/transactionController";
import { authMiddleware } from "../middleware/authMiddleware";

const route = express.Router();

route.get("/dashboard", authMiddleware, getDashboardData);
