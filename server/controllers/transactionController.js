import Transaction from "../models/Transaction.js";

// Create Transaction
export const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      title,
      amount,
      category,
      date,
      notes,
      recurring,
      attachments,
    } = req.body;

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      title,
      amount,
      category,
      date,
      notes,
      recurring,
      attachments,
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
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
    const transactions = await Transaction.find({ userId: req.user.id }).sort({
      date: -1,
    });
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
export const getDashboardData = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      // Step 1: Filter only the current user's transactions
      { $match: { userId: req.user.id } },

      // Step 2: Group by type (income/expense) and calculate totals
      {
        $group: {
          _id: "$type", // group by "income" or "expense"
          total: { $sum: "$amount" }, // sum all amounts in each group
        },
      },
    ]);

    // Step 3: Extract income and expense from result
    let income = 0;
    let expense = 0;

    result.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    const balance = income - expense;

    // Step 4: Send response
    res.json({
      success: true,
      dashboard: { income, expense, balance },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating dashboard data",
      error: error.message,
    });
  }
};
