import mongoose from "mongoose";
const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Linking to the User model
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true, // removes extra spaces
    },
    limit: {
      type: Number,
      required: true,
      min: 0, // limit can’t be negative
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"], // restricts to valid options
      default: "monthly",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
