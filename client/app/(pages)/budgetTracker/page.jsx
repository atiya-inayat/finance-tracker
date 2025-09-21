"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/axios.js"; // 👈 adjust path if needed

export default function Budgeting() {
  const [budgets, setBudgets] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [newPeriod, setNewPeriod] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const [editPeriod, setEditPeriod] = useState("");

  const categories = [
    "Food",
    "Transport",
    "Bills",
    "Shopping",
    "Salary",
    "Investment",
    "Entertainment",
    "Healthcare",
    "Education",
    "Other",
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  const addBudget = async (e) => {
    e.preventDefault();
    try {
      await api.post("/budgets", {
        category: newCategory,
        limit: Number(newLimit),
        period: newPeriod,
      });
      setNewCategory("");
      setNewLimit("");
      setNewPeriod("");
      fetchBudgets();
    } catch (err) {
      console.error("Error adding budget:", err);
    }
  };

  const startEditing = (budget) => {
    setEditingId(budget._id);
    setEditCategory(budget.category);
    setEditLimit(budget.limit);
    setEditPeriod(budget.period);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/budgets/${id}`, {
        category: editCategory,
        limit: Number(editLimit),
        period: editPeriod,
      });
      setEditingId(null);
      fetchBudgets();
    } catch (err) {
      console.error("Error updating budget:", err);
    }
  };

  const deleteBudget = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error("Error deleting budget:", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Budgeting</h2>

      {/* Add Budget Form */}
      <form onSubmit={addBudget} className="mb-6 grid gap-4 sm:grid-cols-3">
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border p-2 rounded w-full text-black"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Limit"
          value={newLimit}
          onChange={(e) => setNewLimit(e.target.value)}
          className="border p-2 rounded w-full text-black"
          required
        />

        <select
          value={newPeriod}
          onChange={(e) => setNewPeriod(e.target.value)}
          className="border p-2 rounded w-full text-black"
          required
        >
          <option value="">Select Period</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 sm:col-span-3"
        >
          Add Budget
        </button>
      </form>

      {/* Budgets List */}
      <div className="space-y-4">
        {budgets.map((budget) => {
          const spent = budget.spent || 0;
          const percentage = Math.min((spent / budget.limit) * 100, 100);

          return (
            <div key={budget._id} className="border p-4 rounded shadow">
              {editingId === budget._id ? (
                <div className="grid gap-2 sm:grid-cols-4">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="border p-2 rounded text-black"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    className="border p-2 rounded text-black"
                  />

                  <select
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(e.target.value)}
                    className="border p-2 rounded text-black"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(budget._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{budget.category}</h3>
                    <span className="text-sm text-gray-500">
                      {budget.period}
                    </span>
                  </div>
                  <p>
                    Limit: ${budget.limit} | Spent: ${spent}
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      spent >= budget.limit ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {spent >= budget.limit
                      ? "⚠️ Over budget!"
                      : `Remaining: $${budget.limit - spent}`}
                  </p>

                  <div className="w-full bg-gray-300 rounded h-4 mt-2">
                    <div
                      className={`h-4 rounded ${
                        percentage >= 100 ? "bg-red-600" : "bg-green-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => startEditing(budget)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBudget(budget._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
