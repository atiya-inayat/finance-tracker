import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import { Parser } from "json2csv";
import Budget from "../models/Budget.js";

// Create Transaction
export const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      amount,
      // category,
      createdAt,
      notes,
      recurring,
      attachments,
      budgetId, // ✅ add budgetId
    } = req.body;

    // Optional: Check if budgetId exists
    if (budgetId) {
      const budget = await Budget.findById(budgetId);
      if (!budget) {
        return res.status(400).json({
          success: false,
          message: "Invalid budgetId provided",
        });
      }
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      // category,
      createdAt,
      notes,
      recurring,
      attachments,
      budgetId: budgetId || null, // link budget if provided
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating transaction",
      error: error.message,
    });
  }
};

// Get All Transactions (User-Specific)
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate("budgetId", "name category") // 👈 this pulls budget.name and budget.category

      .sort({
        createdAt: -1,
      });

    console.log({ transactions });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

// Get Single Transaction by ID
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transaction",
      error: error.message,
    });
  }
};

// Update Transaction
export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating transaction",
      error: error.message,
    });
  }
};

// Delete Transaction
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting transaction",
      error: error.message,
    });
  }
};

// Analytics: Income / Expense Summary

// Analytics: Income / Expense Summary + Expenses by Category
export const getDashboardData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1️⃣ Summary (income, expense, balance)
    const result = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    result.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    const balance = income - expense;

    // 2️⃣ Category-wise expense breakdown
    // const categories = await Transaction.aggregate([
    //   { $match: { userId, type: "expense" } }, // only expenses
    //   {
    //     $group: {
    //       _id: "$category",
    //       amount: { $sum: "$amount" },
    //     },
    //   },
    //   {
    //     $project: {
    //       category: "$_id",
    //       amount: 1,
    //       _id: 0,
    //     },
    //   },
    // ]);
    // 2️⃣ Category-wise expense breakdown (from budgets)
    const categories = await Transaction.aggregate([
      { $match: { userId, type: "expense" } }, // only expenses

      {
        $group: {
          _id: "$budgetId", // group by budgetId
          amount: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "budgets", // Mongo collection name
          localField: "_id", // transaction.budgetId
          foreignField: "_id", // budget._id
          as: "budget",
        },
      },
      { $unwind: "$budget" },
      {
        $project: {
          _id: 0,
          category: "$budget.category", // 👈 use budget.category
          amount: 1,
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // 3️⃣ Send response
    res.json({
      success: true,
      dashboard: { income, expense, balance },
      categories, // 👈 now frontend can use this for charts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating dashboard data",
      error: error.message,
    });
  }
};

export const getAdvancedAnalytics = async (req, res) => {
  try {
    const { groupBy } = req.query; // e.g., category or month

    let groupStage = {};

    if (groupBy === "month") {
      groupStage = {
        _id: { $month: "$date" }, // group by month number (1–12)
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      };
    } else {
      // default: group by category
      groupStage = {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      };
    }

    const result = await Transaction.aggregate([{ $group: groupStage }]);

    res.json(result);
  } catch (error) {
    console.error("Error grouping transactions:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const exportTransactions = async (req, res) => {
  try {
    // 1. Fetch all transactions for the logged-in user
    const transactions = await Transaction.find({
      userId: req.user._id,
    }).lean();

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found to export" });
    }

    // 2. Convert JSON → CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(transactions);

    // 3. Send as downloadable file
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting transactions:", error);
    res.status(500).json({ message: "Server error while exporting", error });
  }
};
