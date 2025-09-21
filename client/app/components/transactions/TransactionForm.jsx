// frontend/app/components/transactions/TransactionForm.jsx

"use client";

import { useState, useEffect } from "react";
// Import named exports from the api.js file
import { createTransaction, getBudgets } from "@/app/lib/api";

const TransactionForm = ({ onTransactionAdded }) => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState("");

  // Fetch budgets from the backend when the component loads
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        // Use the getBudgets function from your api.js file
        const data = await getBudgets();
        setBudgets(data);
        // Set the first budget as the default selected one if available
        if (data.length > 0) {
          setSelectedBudget(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch budgets:", err);
      }
    };
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct the transaction data object
    const transactionData = {
      amount: parseFloat(amount),
      type,
      category,
      notes,
      // Only include budgetId if the type is 'expense' and a budget is selected
      budgetId:
        type === "expense" && selectedBudget ? selectedBudget : undefined,
    };

    try {
      // Use the createTransaction function from your api.js file
      await createTransaction(transactionData);

      // Clear the form after a successful submission
      setAmount("");
      setType("income");
      setCategory("");
      setNotes("");
      setSelectedBudget("");

      // Call the parent function to refresh the transaction list
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (err) {
      console.error("Failed to add transaction:", err);
      // Handle error, e.g., show an error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add a new Transaction</h2>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Type Selector (Income/Expense) */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Conditional Budget Selector */}
      {type === "expense" && budgets.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Assign to Budget (Optional)
          </label>
          <select
            value={selectedBudget}
            onChange={(e) => {
              setSelectedBudget(e.target.value);
              const budgetCategory = budgets.filter(
                (budget) => budget._id === e.target.value
              );
              if (budgetCategory.length === 0) {
                setCategory("");
              } else {
                setCategory(budgetCategory[0].category);
              }
            }}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

      {/* Category Input */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Category
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Note Input */}
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Notes
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Transaction
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
