import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

// ✅ Get Financial Summary
export const getFinancialSummary = async (req, res) => {
  try {
    const userId = req.user._id; // from authMiddleware

    // Optional query filters
    const { startDate, endDate } = req.query;

    let matchStage = { userId: new mongoose.Types.ObjectId(userId) };

    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // ✅ Aggregation Pipeline
    const summary = await Transaction.aggregate([
      { $match: matchStage },

      {
        $facet: {
          // 1️⃣ Monthly Income vs Expenses
          monthlyIncomeVsExpenses: [
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                  type: "$type",
                },
                total: { $sum: "$amount" },
              },
            },
            {
              $group: {
                _id: { year: "$_id.year", month: "$_id.month" },
                income: {
                  $sum: {
                    $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
                  },
                },
                expenses: {
                  $sum: {
                    $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
                  },
                },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],

          // 2️⃣ Category Spending (only for expenses)
          categorySpending: [
            { $match: { type: "expense" } },
            {
              $group: {
                _id: "$category",
                total: { $sum: "$amount" },
              },
            },
            { $sort: { total: -1 } },
          ],

          // 3️⃣ Cash Flow (Net Income - Expenses over time)
          cashFlow: [
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  month: { $month: "$date" },
                },
                income: {
                  $sum: {
                    $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
                  },
                },
                expenses: {
                  $sum: {
                    $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                  },
                },
              },
            },
            {
              $project: {
                year: "$_id.year",
                month: "$_id.month",
                income: 1,
                expenses: 1,
                netCashFlow: { $subtract: ["$income", "$expenses"] },
              },
            },
            { $sort: { year: 1, month: 1 } },
          ],
        },
      },
    ]);

    res.json(summary[0]);
  } catch (error) {
    console.error("Error generating financial summary:", error);
    res.status(500).json({ message: "Server error while generating summary" });
  }
};
