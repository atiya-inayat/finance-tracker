"use client";

import { useState, useEffect } from "react";
import {
  createTransaction,
  updateTransaction,
  getBudgets,
} from "@/app/lib/api";

const TransactionForm = ({ editData, onTransactionAdded, onCancel }) => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // ✅ Load budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await getBudgets();
        setBudgets(data);
      } catch (err) {
        console.error("Failed to fetch budgets:", err);
      }
    };
    fetchBudgets();
  }, []);

  // ✅ Pre-fill form if editing
  useEffect(() => {
    if (editData) {
      setAmount(editData.amount || "");
      setType(editData.type || "income");
      setCategory(editData.category || "");
      setNotes(editData.notes || "");
      setSelectedBudget(editData.budgetId?._id || "");
      setCreatedAt(
        editData.createdAt
          ? new Date(editData.createdAt).toISOString().split("T")[0]
          : ""
      );
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const transactionData = {
      amount: parseFloat(amount),
      type,
      category,
      notes,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      budgetId:
        type === "expense" && selectedBudget ? selectedBudget : undefined,
    };

    try {
      if (editData) {
        // ✅ Update existing
        await updateTransaction(editData._id, transactionData);
      } else {
        // ✅ Create new
        await createTransaction(transactionData);
      }

      // Reset form
      setAmount("");
      setType("income");
      setCategory("");
      setNotes("");
      setSelectedBudget("");
      setCreatedAt("");

      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
      console.error("Failed to save transaction:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {editData ? "Edit Transaction" : "Add a new Transaction"}
      </h2>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700"
          required
        />
      </div>

      {/* Type */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Budget */}
      {type === "expense" && budgets.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Assign to Budget (Optional)
          </label>
          <select
            value={selectedBudget}
            onChange={(e) => {
              setSelectedBudget(e.target.value);
              const budgetCategory = budgets.find(
                (b) => b._id === e.target.value
              );
              setCategory(budgetCategory ? budgetCategory.category : "");
            }}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
          >
            <option value="">None</option>
            {budgets.map((budget) => (
              <option key={budget._id} value={budget._id}>
                {budget.category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Category
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700"
          required
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Notes
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>

      {/* Created Date */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Created At
        </label>
        <input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {editData ? "Update Transaction" : "Add Transaction"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="ml-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TransactionForm;
