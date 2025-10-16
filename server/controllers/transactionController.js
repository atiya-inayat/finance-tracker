import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import { Parser } from "json2csv";
import Budget from "../models/Budget.js";
import { getRate } from "../utils/exchangeRate.js";

// ----------------------------
// Create Transaction
// ----------------------------
export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, createdAt, notes, recurring, attachments, budgetId } =
      req.body;

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
      createdAt,
      notes,
      recurring,
      attachments,
      budgetId: budgetId || null,
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

// ----------------------------
// Get All Transactions (with currency conversion)
// ----------------------------
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userCurrency = req.user.currency || "USD";

    const transactions = await Transaction.find({ userId })
      .populate("budgetId", "name category")
      .sort({ createdAt: -1 })
      .lean();

    const { rate, symbol } = await getRate(userCurrency);

    const converted = transactions.map((t) => ({
      ...t,
      amountConverted: +(t.amount * rate).toFixed(2),
      currency: userCurrency,
      symbol,
    }));

    res.json({ success: true, transactions: converted });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.message,
    });
  }
};

// ----------------------------
// Get Single Transaction by ID
// ----------------------------
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

    const userCurrency = req.user.currency || "USD";
    const { rate, symbol } = await getRate(userCurrency);

    res.json({
      success: true,
      transaction: {
        ...transaction.toObject(),
        amountConverted: +(transaction.amount * rate).toFixed(2),
        currency: userCurrency,
        symbol,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching transaction",
      error: error.message,
    });
  }
};

// ----------------------------
// Update Transaction
// ----------------------------
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

// ----------------------------
// Delete Transaction
// ----------------------------
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

// ----------------------------
// Dashboard Data (with currency conversion)
// ----------------------------
export const getDashboardData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userCurrency = req.user.currency || "USD";
    const { rate, symbol } = await getRate(userCurrency);

    // 1️⃣ Summary totals
    const result = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    let income = 0;
    let expense = 0;

    result.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    const balance = income - expense;

    // 2️⃣ Category-wise expenses
    const categories = await Transaction.aggregate([
      { $match: { userId, type: "expense" } },
      { $group: { _id: "$budgetId", amount: { $sum: "$amount" } } },
      {
        $lookup: {
          from: "budgets",
          localField: "_id",
          foreignField: "_id",
          as: "budget",
        },
      },
      { $unwind: "$budget" },
      {
        $project: {
          _id: 0,
          budgetId: "$budget._id",
          category: "$budget.category",
          amount: 1,
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // Convert totals + categories
    res.json({
      success: true,
      dashboard: {
        income: +(income * rate).toFixed(2),
        expense: +(expense * rate).toFixed(2),
        balance: +(balance * rate).toFixed(2),
        totalTransactions: await Transaction.countDocuments({ userId }),
        currency: userCurrency,
        symbol,
      },
      categories: categories.map((c) => ({
        ...c,
        amount: +(c.amount * rate).toFixed(2),
        currency: userCurrency,
        symbol,
      })),
    });
  } catch (error) {
    console.error("Error generating dashboard data", error);
    res.status(500).json({
      success: false,
      message: "Error generating dashboard data",
      error: error.message,
    });
  }
};

// ----------------------------
// Advanced Analytics (optional)
// ----------------------------
export const getAdvancedAnalytics = async (req, res) => {
  try {
    const { groupBy } = req.query;
    let groupStage = {};

    if (groupBy === "month") {
      groupStage = {
        _id: { $month: "$date" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      };
    } else {
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

// ----------------------------
// Export Transactions (CSV, converted)
// ----------------------------
export const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user._id,
    }).lean();

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found to export" });
    }

    const userCurrency = req.user.currency || "USD";
    const { rate, symbol } = await getRate(userCurrency);

    const transactionsConverted = transactions.map((t) => ({
      ...t,
      amount: +(t.amount * rate).toFixed(2),
      currency: userCurrency,
      symbol,
    }));

    const csv = new Parser().parse(transactionsConverted);

    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting transactions:", error);
    res.status(500).json({ message: "Server error while exporting", error });
  }
};
