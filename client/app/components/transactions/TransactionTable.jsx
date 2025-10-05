// "use client";

// import React, { useState, useEffect } from "react";
// import { getTransactions, deleteTransaction } from "@/app/lib/api";
// import TransactionForm from "./TransactionForm";

// const TransactionManager = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editTx, setEditTx] = useState(null);

//   // fetch all transactions
//   const fetchTransactions = async () => {
//     try {
//       const data = await getTransactions();
//       setTransactions(
//         Array.isArray(data.transactions) ? data.transactions : []
//       );
//     } catch (error) {
//       console.error("Failed to fetch transactions:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTransactions();
//   }, []);

//   // handle delete
//   const handleDelete = async (id) => {
//     try {
//       await deleteTransaction(id);
//       setTransactions((prev) => prev.filter((tx) => tx._id !== id));
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   if (loading) return <p className="text-black">Loading transactions...</p>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen text-black">
//       {showForm ? (
//         <TransactionForm
//           editData={editTx}
//           onTransactionAdded={async () => {
//             await fetchTransactions();
//             setShowForm(false);
//             setEditTx(null);
//           }}
//           onCancel={() => {
//             setShowForm(false);
//             setEditTx(null);
//           }}
//         />
//       ) : (
//         <div className="bg-white shadow-lg rounded-xl p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold">Transactions</h2>
//             <button
//               onClick={() => setShowForm(true)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
//             >
//               + Create Transaction
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse rounded-lg overflow-hidden shadow">
//               <thead className="bg-blue-100 text-left">
//                 <tr>
//                   <th className="p-3">Category</th>
//                   <th className="p-3">Type</th>
//                   <th className="p-3">Notes</th>
//                   <th className="p-3">Created At</th>
//                   <th className="p-3">Amount</th>
//                   <th className="p-3 text-center">Edit</th>
//                   <th className="p-3 text-center">Delete</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {transactions.length === 0 ? (
//                   <tr>
//                     <td colSpan="7" className="text-center p-4 text-gray-500">
//                       No transactions found
//                     </td>
//                   </tr>
//                 ) : (
//                   transactions.map((tx, index) => (
//                     <tr
//                       key={tx._id}
//                       className={`${
//                         index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                       } hover:bg-gray-100 transition`}
//                     >
//                       {/* hello there */}
//                       <td className="p-3">{tx.budgetId?.category || "-"}</td>

//                       {/* ✅ Type with color */}
//                       <td
//                         className={`p-3 font-semibold capitalize ${
//                           tx.type === "income"
//                             ? "text-green-600"
//                             : "text-red-600"
//                         }`}
//                       >
//                         {tx.type}
//                       </td>

//                       <td className="p-3">{tx.notes || "-"}</td>
//                       <td className="p-3">
//                         {tx.createdAt
//                           ? new Date(tx.createdAt).toLocaleDateString()
//                           : "-"}
//                       </td>

//                       {/* ✅ Amount with color */}
//                       <td
//                         className={`p-3 font-semibold ${
//                           tx.type === "income"
//                             ? "text-green-600"
//                             : "text-red-600"
//                         }`}
//                       >
//                         {tx.type === "income" ? "+" : "-"}${tx.amount}
//                       </td>

//                       <td className="p-3 text-center">
//                         <button
//                           onClick={() => {
//                             setEditTx(tx);
//                             setShowForm(true);
//                           }}
//                           className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition shadow"
//                         >
//                           Edit
//                         </button>
//                       </td>
//                       <td className="p-3 text-center">
//                         <button
//                           onClick={() => handleDelete(tx._id)}
//                           className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition shadow"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TransactionManager;

"use client";

import React, { useState, useEffect } from "react";
import { getTransactions, deleteTransaction } from "@/app/lib/api";
import TransactionForm from "./TransactionForm";

const TransactionManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);

  // filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // fetch all transactions
  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(
        Array.isArray(data.transactions) ? data.transactions : []
      );
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // handle delete
  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ✅ Apply filters + search
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.budgetId?.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory
      ? tx.budgetId?.category === filterCategory
      : true;

    const matchesType = filterType ? tx.type === filterType : true;

    const matchesDate = filterDate
      ? new Date(tx.createdAt).toLocaleDateString() ===
        new Date(filterDate).toLocaleDateString()
      : true;

    return matchesSearch && matchesCategory && matchesType && matchesDate;
  });

  // collect unique categories for dropdown
  const categories = [
    ...new Set(transactions.map((tx) => tx.budgetId?.category).filter(Boolean)),
  ];

  // ✅ Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterType("");
    setFilterDate("");
  };

  if (loading) return <p className="text-black">Loading transactions...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      {showForm ? (
        <TransactionForm
          editData={editTx}
          onTransactionAdded={async () => {
            await fetchTransactions();
            setShowForm(false);
            setEditTx(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditTx(null);
          }}
        />
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Transactions</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
            >
              + Create Transaction
            </button>
          </div>

          {/* ✅ Search Section */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by notes or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded-lg w-full"
            />
          </div>

          {/* ✅ Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border rounded-lg w-full"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-2 border rounded-lg w-full"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 border rounded-lg w-full"
            />

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="bg-gray-300 text-black px-4 py-2 rounded-lg shadow hover:bg-gray-400 transition w-full"
            >
              Clear Filters
            </button>
          </div>

          {/* ✅ Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow">
              <thead className="bg-blue-100 text-left">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-center">Edit</th>
                  <th className="p-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <tr
                      key={tx._id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="p-3">{tx.budgetId?.category || "-"}</td>
                      <td
                        className={`p-3 font-semibold capitalize ${
                          tx.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type}
                      </td>
                      <td className="p-3">{tx.notes || "-"}</td>
                      <td className="p-3">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td
                        className={`p-3 font-semibold ${
                          tx.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}${tx.amount}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setEditTx(tx);
                            setShowForm(true);
                          }}
                          className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 transition shadow"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition shadow"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
