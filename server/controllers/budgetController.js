import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

// ✅ Create a new budget
export const createBudget = async (req, res) => {
  try {
    const { category, limit, period } = req.body;

    const budget = await Budget.create({
      userId: req.user._id,
      category: category.toLowerCase(),
      limit,
      period,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: "Error creating budget", error });
  }
};

// ✅ Get all budgets with spent + remaining (Updated and Corrected)
// export const getBudgets = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const budgets = await Budget.aggregate([
//       // 1️⃣ Match budgets by user
//       { $match: { userId: new mongoose.Types.ObjectId(userId) } },

//       // 2️⃣ Lookup transactions linked to this budget
//       {
//         $lookup: {
//           from: "transactions", // collection name (lowercase & plural of model)
//           localField: "_id",
//           foreignField: "budgetId",
//           as: "transactions",
//         },
//       },

//       // 3️⃣ Add totalUsed field (sum of all transaction amounts)
//       {
//         $addFields: {
//           spent: { $sum: "$transactions.amount" },
//         },
//       },
//     ]);

//     res.json(budgets);
//   } catch (error) {
//     console.error("Error fetching budgets:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
// ✅ Get all budgets with spent + remaining (with period filtering)
// export const getBudgets = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const now = new Date();

//     const budgets = await Budget.aggregate([
//       { $match: { userId: new mongoose.Types.ObjectId(userId) } },

//       {
//         $lookup: {
//           from: "transactions",
//           let: {
//             budgetId: "$_id",
//             budgetCategory: "$category",
//             budgetPeriod: "$period",
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$budgetId", "$$budgetId"] },
//                 type: "expense",
//               },
//             },
//             {
//               $addFields: {
//                 matchesPeriod: {
//                   $switch: {
//                     branches: [
//                       {
//                         case: { $eq: ["$$budgetPeriod", "daily"] },
//                         then: {
//                           $gte: [
//                             "$date",
//                             new Date(
//                               now.getFullYear(),
//                               now.getMonth(),
//                               now.getDate()
//                             ),
//                           ],
//                         },
//                       },
//                       {
//                         case: { $eq: ["$$budgetPeriod", "weekly"] },
//                         then: {
//                           $gte: [
//                             "$date",
//                             new Date(
//                               now.getFullYear(),
//                               now.getMonth(),
//                               now.getDate() - now.getDay()
//                             ),
//                           ],
//                         },
//                       },
//                       {
//                         case: { $eq: ["$$budgetPeriod", "monthly"] },
//                         then: {
//                           $gte: [
//                             "$date",
//                             new Date(now.getFullYear(), now.getMonth(), 1),
//                           ],
//                         },
//                       },
//                       {
//                         case: { $eq: ["$$budgetPeriod", "yearly"] },
//                         then: {
//                           $gte: ["$date", new Date(now.getFullYear(), 0, 1)],
//                         },
//                       },
//                     ],
//                     default: true,
//                   },
//                 },
//               },
//             },
//             { $match: { matchesPeriod: true } },
//           ],
//           as: "transactions",
//         },
//       },
//       {
//         $addFields: {
//           spent: { $sum: "$transactions.amount" },
//         },
//       },
//     ]);

//     res.json(budgets);
//   } catch (error) {
//     console.error("Error fetching budgets:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const budgets = await Budget.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "transactions",
          let: {
            budgetId: "$_id",
            budgetPeriod: "$period",
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$budgetId", "$$budgetId"] },
                type: "expense",
              },
            },
            {
              $match: {
                $expr: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$$budgetPeriod", "daily"] },
                        then: {
                          $gte: [
                            "$date",
                            new Date(
                              now.getFullYear(),
                              now.getMonth(),
                              now.getDate()
                            ),
                          ],
                        },
                      },
                      {
                        case: { $eq: ["$$budgetPeriod", "weekly"] },
                        then: {
                          $gte: [
                            "$date",
                            new Date(
                              now.getFullYear(),
                              now.getMonth(),
                              now.getDate() - now.getDay()
                            ),
                          ],
                        },
                      },
                      {
                        case: { $eq: ["$$budgetPeriod", "monthly"] },
                        then: {
                          $gte: [
                            "$date",
                            new Date(now.getFullYear(), now.getMonth(), 1),
                          ],
                        },
                      },
                      {
                        case: { $eq: ["$$budgetPeriod", "yearly"] },
                        then: {
                          $gte: ["$date", new Date(now.getFullYear(), 0, 1)],
                        },
                      },
                    ],
                    default: true,
                  },
                },
              },
            },
          ],
          as: "transactions",
        },
      },
      {
        $addFields: {
          spent: { $sum: "$transactions.amount" },
        },
      },
    ]);

    res.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Update budget
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

// ✅ Delete budget
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

// ✅ Check budget spending (for single budget)
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
          type: "expense",
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
