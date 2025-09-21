import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Budget",
    required: false,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  // category: {
  //   type: String,
  //   enum: [
  //     "Food",
  //     "Transport",
  //     "Bills",
  //     "Shopping",
  //     "Salary",
  //     "Investment",
  //     "Entertainment",
  //     "Healthcare",
  //     "Education",
  //     "Other",
  //   ],
  // },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true, // Optional description
  },

  // 🌟 Premium Features
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: null,
    },
    nextOccurrence: {
      type: Date,
      default: null,
    },
  },
  attachments: [
    {
      fileUrl: String, // e.g., receipt image stored in cloud
      fileType: String,
    },
  ],
  budgetCategory: {
    type: String,
    default: null, // link to custom budget categories (premium)
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
