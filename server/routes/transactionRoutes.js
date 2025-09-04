import express from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
} from "../controllers/transactionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.post("/", authMiddleware, createTransaction); // Create
router.get("/", authMiddleware, getTransactions); // Get all
router.get("/summary", authMiddleware, getSummary); // Summary (must be before :id)
router.get("/:id", authMiddleware, getTransactionById); // Get by ID
router.put("/:id", authMiddleware, updateTransaction); // Update
router.delete("/:id", authMiddleware, deleteTransaction); // Delete

export default router;
