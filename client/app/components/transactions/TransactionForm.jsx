// "use client";

// import { useState, useEffect } from "react";
// import {
//   createTransaction,
//   updateTransaction,
//   getBudgets,
// } from "@/app/lib/api";

// const TransactionForm = ({ editData, onTransactionAdded, onCancel }) => {
//   const [amount, setAmount] = useState("");
//   const [type, setType] = useState("income");
//   const [category, setCategory] = useState("");
//   const [notes, setNotes] = useState("");
//   const [budgets, setBudgets] = useState([]);
//   const [selectedBudget, setSelectedBudget] = useState("");
//   const [createdAt, setCreatedAt] = useState("");

//   // ✅ Load budgets
//   useEffect(() => {
//     const fetchBudgets = async () => {
//       try {
//         const data = await getBudgets();
//         setBudgets(data);
//       } catch (err) {
//         console.error("Failed to fetch budgets:", err);
//       }
//     };
//     fetchBudgets();
//   }, []);

//   // ✅ Pre-fill form if editing
//   useEffect(() => {
//     if (editData) {
//       setAmount(editData.amount || "");
//       setType(editData.type || "income");
//       setCategory(editData.category || "");
//       setNotes(editData.notes || "");
//       setSelectedBudget(editData.budgetId?._id || "");
//       setCreatedAt(
//         editData.createdAt
//           ? new Date(editData.createdAt).toISOString().split("T")[0]
//           : ""
//       );
//     }
//   }, [editData]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const transactionData = {
//       amount: parseFloat(amount),
//       type,
//       category,
//       notes,
//       createdAt: createdAt ? new Date(createdAt) : undefined,
//       budgetId:
//         type === "expense" && selectedBudget ? selectedBudget : undefined,
//     };

//     try {
//       if (editData) {
//         // ✅ Update existing
//         await updateTransaction(editData._id, transactionData);
//       } else {
//         // ✅ Create new
//         await createTransaction(transactionData);
//       }

//       // Reset form
//       setAmount("");
//       setType("income");
//       setCategory("");
//       setNotes("");
//       setSelectedBudget("");
//       setCreatedAt("");

//       if (onTransactionAdded) onTransactionAdded();
//     } catch (err) {
//       console.error("Failed to save transaction:", err);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md">
//       <h2 className="mb-4 text-xl font-bold">
//         {editData ? "Edit Transaction" : "Add a new Transaction"}
//       </h2>

//       {/* Amount */}
//       <div className="mb-4">
//         <label className="block mb-2 text-sm font-bold text-gray-700">
//           Amount
//         </label>
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           className="w-full px-3 py-2 text-gray-700 border rounded shadow"
//           required
//         />
//       </div>

//       {/* Type */}
//       <div className="mb-4">
//         <label className="block mb-2 text-sm font-bold text-gray-700">
//           Type
//         </label>
//         <select
//           value={type}
//           onChange={(e) => setType(e.target.value)}
//           className="w-full px-3 py-2 text-gray-700 border rounded shadow"
//         >
//           <option value="income">Income</option>
//           <option value="expense">Expense</option>
//         </select>
//       </div>

//       {/* Budget */}
//       {type === "expense" && budgets.length > 0 && (
//         <div className="mb-4">
//           <label className="block mb-2 text-sm font-bold text-gray-700">
//             Assign to Budget (Optional)
//           </label>
//           <select
//             value={selectedBudget}
//             onChange={(e) => {
//               setSelectedBudget(e.target.value);
//               const budgetCategory = budgets.find(
//                 (b) => b._id === e.target.value
//               );
//               setCategory(budgetCategory ? budgetCategory.category : "");
//             }}
//             className="w-full px-3 py-2 text-gray-700 border rounded shadow"
//           >
//             <option value="">None</option>
//             {budgets.map((budget) => (
//               <option key={budget._id} value={budget._id}>
//                 {budget.category}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Category */}
//       <div className="mb-4">
//         <label className="block mb-2 text-sm font-bold text-gray-700">
//           Category
//         </label>
//         <input
//           type="text"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           className="w-full px-3 py-2 text-gray-700 border rounded shadow"
//           required
//         />
//       </div>

//       {/* Notes */}
//       <div className="mb-4">
//         <label className="block mb-2 text-sm font-bold text-gray-700">
//           Notes
//         </label>
//         <input
//           type="text"
//           value={notes}
//           onChange={(e) => setNotes(e.target.value)}
//           className="w-full px-3 py-2 text-gray-700 border rounded shadow"
//         />
//       </div>

//       {/* Created Date */}
//       <div className="mb-6">
//         <label className="block mb-2 text-sm font-bold text-gray-700">
//           Created At
//         </label>
//         <input
//           type="date"
//           value={createdAt}
//           onChange={(e) => setCreatedAt(e.target.value)}
//           className="w-full px-3 py-2 text-gray-700 border rounded shadow"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="flex items-center justify-between">
//         <button
//           type="submit"
//           className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
//         >
//           {editData ? "Update Transaction" : "Add Transaction"}
//         </button>

//         {onCancel && (
//           <button
//             type="button"
//             onClick={onCancel}
//             className="px-4 py-2 ml-2 font-bold text-white bg-gray-400 rounded hover:bg-gray-500"
//           >
//             Cancel
//           </button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default TransactionForm;

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
        await updateTransaction(editData._id, transactionData);
      } else {
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
    <form
      onSubmit={handleSubmit}
      className="max-w-md p-6 mx-auto bg-white border border-gray-200 shadow-md rounded-2xl"
    >
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        {editData ? "Edit Transaction" : "Add New Transaction"}
      </h2>

      {/* Amount */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
          required
        />
      </div>

      {/* Type */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Budget */}
      {type === "expense" && budgets.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
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
            className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
        <label className="block mb-2 font-medium text-gray-700">Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
          required
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {/* Created At */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Created At
        </label>
        <input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="px-4 py-2 text-white transition bg-gray-900 rounded-lg hover:bg-blue-700"
        >
          {editData ? "Update" : "Add"} Transaction
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
