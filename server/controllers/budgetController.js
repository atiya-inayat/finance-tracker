import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

// Create a new budget
export const createBudget = async (req, res) => {
  try {
    const { category, limit, period } = req.body;

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      limit,
      period,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: "Error creating budget", error });
  }
};

// Get all budgets
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching budgets", error });
  }
};

// Update budget
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: "Error updating budget", error });
  }
};

// Delete budget
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting budget", error });
  }
};

// Check budget spending
export const checkBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({ _id: id, userId: req.user._id });
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    let startDate;
    const now = new Date();

    switch (budget.period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        const firstDayOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const transactions = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          category: budget.category,
          date: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const totalSpent = transactions.length > 0 ? transactions[0].totalSpent : 0;
    const remaining = budget.limit - totalSpent;

    res.json({
      category: budget.category,
      period: budget.period,
      limit: budget.limit,
      totalSpent,
      remaining,
      withinBudget: remaining >= 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking budget", error });
  }
};
