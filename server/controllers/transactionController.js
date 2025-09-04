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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting transaction",
        error: error.message,
      });
  }
};

// Analytics: Income / Expense Summary
export const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    res.json({ success: true, summary: { income, expense, balance } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error generating summary",
        error: error.message,
      });
  }
};
