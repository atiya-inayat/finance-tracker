// "use client";

// import { useState, useEffect } from "react";
// import api from "@/app/lib/axios.js";
// import FloatingAIChat from "../aiChat/page";

// export default function Budgeting() {
//   const [budgets, setBudgets] = useState([]);
//   const [newCategory, setNewCategory] = useState("");
//   const [newLimit, setNewLimit] = useState("");
//   const [newPeriod, setNewPeriod] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [editCategory, setEditCategory] = useState("");
//   const [editLimit, setEditLimit] = useState("");
//   const [editPeriod, setEditPeriod] = useState("");

//   const categories = [
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
//   ];

//   useEffect(() => {
//     fetchBudgets();
//   }, []);

//   const fetchBudgets = async () => {
//     try {
//       const res = await api.get("/budgets");
//       setBudgets(res.data);
//     } catch (err) {
//       console.error("Error fetching budgets:", err);
//     }
//   };

//   const addBudget = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post("/budgets", {
//         category: newCategory,
//         limit: Number(newLimit),
//         period: newPeriod,
//       });
//       setNewCategory("");
//       setNewLimit("");
//       setNewPeriod("");
//       fetchBudgets();
//     } catch (err) {
//       console.error("Error adding budget:", err);
//     }
//   };

//   const startEditing = (budget) => {
//     setEditingId(budget._id);
//     setEditCategory(budget.category);
//     setEditLimit(budget.limit);
//     setEditPeriod(budget.period);
//   };

//   const saveEdit = async (id) => {
//     try {
//       await api.put(`/budgets/${id}`, {
//         category: editCategory,
//         limit: Number(editLimit),
//         period: editPeriod,
//       });
//       setEditingId(null);
//       fetchBudgets();
//     } catch (err) {
//       console.error("Error updating budget:", err);
//     }
//   };

//   const deleteBudget = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this budget?")) return;
//     try {
//       await api.delete(`/budgets/${id}`);
//       fetchBudgets();
//     } catch (err) {
//       console.error("Error deleting budget:", err);
//     }
//   };

//   return (
//     <div className="max-w-4xl p-6 mx-auto">
//       <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
//         Budgeting
//       </h2>

//       {/* Add Budget Form */}
//       <form
//         onSubmit={addBudget}
//         className="grid gap-4 p-4 mb-6 bg-white border border-gray-200 shadow-md sm:grid-cols-3 rounded-2xl"
//       >
//         <select
//           value={newCategory}
//           onChange={(e) => setNewCategory(e.target.value)}
//           className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
//           required
//         >
//           <option value="">Select Category</option>
//           {categories.map((cat) => (
//             <option key={cat} value={cat}>
//               {cat}
//             </option>
//           ))}
//         </select>

//         <input
//           type="number"
//           placeholder="Limit"
//           value={newLimit}
//           onChange={(e) => setNewLimit(e.target.value)}
//           className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
//           required
//         />

//         <select
//           value={newPeriod}
//           onChange={(e) => setNewPeriod(e.target.value)}
//           className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
//           required
//         >
//           <option value="">Select Period</option>
//           <option value="weekly">Weekly</option>
//           <option value="monthly">Monthly</option>
//           <option value="yearly">Yearly</option>
//         </select>

//         <button
//           type="submit"
//           className="py-2 text-white transition bg-gray-900 rounded-lg hover:bg-gray-800 sm:col-span-3"
//         >
//           Add Budget
//         </button>
//       </form>

//       {/* Budgets List */}
//       <div className="space-y-4">
//         {budgets.map((budget) => {
//           const spent = budget.spent || 0;
//           const percentage = Math.min((spent / budget.limit) * 100, 100);

//           return (
//             <div
//               key={budget._id}
//               className="p-4 bg-white border border-gray-200 shadow-md rounded-2xl"
//             >
//               {editingId === budget._id ? (
//                 <div className="grid items-center gap-3 sm:grid-cols-4">
//                   <select
//                     value={editCategory}
//                     onChange={(e) => setEditCategory(e.target.value)}
//                     className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat) => (
//                       <option key={cat} value={cat}>
//                         {cat}
//                       </option>
//                     ))}
//                   </select>

//                   <input
//                     type="number"
//                     value={editLimit}
//                     onChange={(e) => setEditLimit(e.target.value)}
//                     className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
//                   />

//                   <select
//                     value={editPeriod}
//                     onChange={(e) => setEditPeriod(e.target.value)}
//                     className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
//                   >
//                     <option value="weekly">Weekly</option>
//                     <option value="monthly">Monthly</option>
//                     <option value="yearly">Yearly</option>
//                   </select>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => saveEdit(budget._id)}
//                       className="px-3 py-1 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={() => setEditingId(null)}
//                       className="px-3 py-1 text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div>
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       {budget.category}
//                     </h3>
//                     <span className="text-sm text-gray-500">
//                       {budget.period}
//                     </span>
//                   </div>
//                   <p className="mt-1 text-gray-700">
//                     Limit: ${budget.limit} | Spent: ${spent}
//                   </p>

//                   <p
//                     className={`mt-1 text-sm font-medium ${
//                       spent >= budget.limit
//                         ? "text-orange-600"
//                         : "text-green-600"
//                     }`}
//                   >
//                     {spent >= budget.limit
//                       ? "⚠️ Over budget!"
//                       : `Remaining: $${budget.limit - spent}`}
//                   </p>

//                   <div className="w-full h-4 mt-2 bg-gray-200 rounded-full">
//                     <div
//                       className={`h-4 rounded-full bg-green-500`}
//                       style={{ width: `${percentage}%` }}
//                     ></div>
//                   </div>

//                   <div className="flex gap-2 mt-3">
//                     <button
//                       onClick={() => startEditing(budget)}
//                       className="px-3 py-1 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => deleteBudget(budget._id)}
//                       className="px-3 py-1 text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       <FloatingAIChat />
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/axios.js";
import FloatingAIChat from "../aiChat/page";

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
    <div className="max-w-4xl p-4 mx-auto sm:p-6">
      <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
        Budgeting
      </h2>

      {/* Add Budget Form */}
      <form
        onSubmit={addBudget}
        className="grid grid-cols-1 gap-4 p-4 mb-6 bg-white border border-gray-200 shadow-md sm:grid-cols-3 rounded-2xl"
      >
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
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
          className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
          required
        />

        <select
          value={newPeriod}
          onChange={(e) => setNewPeriod(e.target.value)}
          className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
          required
        >
          <option value="">Select Period</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button
          type="submit"
          className="py-2 text-white transition bg-gray-900 rounded-lg hover:bg-gray-800 sm:col-span-3"
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
            <div
              key={budget._id}
              className="p-4 bg-white border border-gray-200 shadow-md rounded-2xl"
            >
              {editingId === budget._id ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
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
                    className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                  />

                  <select
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(e.target.value)}
                    className="p-2 text-gray-700 border rounded-lg bg-gray-50 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => saveEdit(budget._id)}
                      className="px-3 py-1 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {budget.category}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {budget.period}
                    </span>
                  </div>

                  <p className="text-gray-700">
                    Limit: ${budget.limit} | Spent: ${spent}
                  </p>

                  <p
                    className={`text-sm font-medium ${
                      spent >= budget.limit
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {spent >= budget.limit
                      ? "⚠️ Over budget!"
                      : `Remaining: $${budget.limit - spent}`}
                  </p>

                  <div className="w-full h-4 mt-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-4 rounded-full bg-green-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => startEditing(budget)}
                      className="px-3 py-1 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBudget(budget._id)}
                      className="px-3 py-1 text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
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

      <FloatingAIChat />
    </div>
  );
}
