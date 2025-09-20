import express from "express";
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  checkBudget,
} from "../controllers/budgetController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new budget
router.post("/", authMiddleware, createBudget);

// Get all budgets of logged-in user
router.get("/", authMiddleware, getBudgets);

// Update a budget by ID
router.put("/:id", authMiddleware, updateBudget);

// Delete a budget by ID
router.delete("/:id", authMiddleware, deleteBudget);

// Check budget spending by ID
router.get("/:id/check", authMiddleware, checkBudget);

export default router;
