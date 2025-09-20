import express from "express";

import { getFinancialSummary } from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", authMiddleware, getFinancialSummary);

export default router;
