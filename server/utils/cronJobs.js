import cron from "node-cron";
import Transaction from "../models/Transaction.js";

// Cron job: runs at midnight on the 1st of every month
cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Running monthly recurring transactions job...");

    // 1. Find all recurring transactions
    const recurringTransactions = await Transaction.find({ isRecurring: true });

    // 2. Duplicate each recurring transaction as a new one
    for (const tx of recurringTransactions) {
      const newTransaction = new Transaction({
        userId: tx.userId,
        type: tx.type,
        title: tx.title,
        amount: tx.amount,
        category: tx.category,
        date: new Date(), // current date for the new entry
        notes: tx.notes,
        recurring: tx.recurring,
        isRecurring: tx.isRecurring,
        attachments: tx.attachments,
      });

      await newTransaction.save();
    }

    console.log("Recurring transactions processed successfully ✅");
  } catch (error) {
    console.error("Error in monthly recurring transactions job:", error);
  }
});
