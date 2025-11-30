// "use client";

// import React, { useState, useEffect } from "react";
// import { getTransactions, deleteTransaction } from "@/app/lib/api";
// import TransactionForm from "./TransactionForm";

// const TransactionManager = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editTx, setEditTx] = useState(null);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterCategory, setFilterCategory] = useState("");
//   const [filterType, setFilterType] = useState("");
//   const [filterDate, setFilterDate] = useState("");

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

//   const handleDelete = async (id) => {
//     try {
//       await deleteTransaction(id);
//       setTransactions((prev) => prev.filter((tx) => tx._id !== id));
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   const filteredTransactions = transactions.filter((tx) => {
//     const matchesSearch =
//       tx.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       tx.budgetId?.category?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesCategory = filterCategory
//       ? tx.budgetId?.category === filterCategory
//       : true;
//     const matchesType = filterType ? tx.type === filterType : true;

//     const matchesDate = filterDate
//       ? new Date(tx.createdAt).toLocaleDateString() ===
//         new Date(filterDate).toLocaleDateString()
//       : true;

//     return matchesSearch && matchesCategory && matchesType && matchesDate;
//   });

//   const categories = [
//     ...new Set(transactions.map((tx) => tx.budgetId?.category).filter(Boolean)),
//   ];

//   const clearFilters = () => {
//     setSearchTerm("");
//     setFilterCategory("");
//     setFilterType("");
//     setFilterDate("");
//   };

//   if (loading)
//     return (
//       <p className="mt-10 text-center text-gray-500">Loading transactions...</p>
//     );

//   return (
//     <div className="min-h-screen p-6 text-gray-800 bg-gray-100">
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
//         <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Transactions
//             </h2>

//             <button
//               onClick={() => setShowForm(true)}
//               className="px-4 py-2 text-white transition bg-gray-900 rounded-lg hover:bg-gray-800"
//             >
//               + Add New
//             </button>
//           </div>

//           {/* Search */}
//           <div className="mb-4">
//             <input
//               type="text"
//               placeholder="Search transactions..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full p-3 text-gray-700 transition border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
//             />
//           </div>

//           {/* Filters */}
//           <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
//             <select
//               value={filterCategory}
//               onChange={(e) => setFilterCategory(e.target.value)}
//               className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
//             >
//               <option value="">All Categories</option>
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>
//                   {cat}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
//             >
//               <option value="">All Types</option>
//               <option value="income">Income</option>
//               <option value="expense">Expense</option>
//             </select>

//             <input
//               type="date"
//               value={filterDate}
//               onChange={(e) => setFilterDate(e.target.value)}
//               className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
//             />

//             <button
//               onClick={clearFilters}
//               className="px-4 py-3 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
//             >
//               Clear Filters
//             </button>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full overflow-hidden border-collapse rounded-lg">
//               <thead className="text-sm font-medium text-gray-600 border-b bg-gray-50">
//                 <tr>
//                   <th className="p-4 text-left">Category</th>
//                   <th className="p-4 text-left">Type</th>
//                   <th className="p-4 text-left">Notes</th>
//                   <th className="p-4 text-left">Date</th>
//                   <th className="p-4 text-left">Amount</th>
//                   <th className="p-4 text-center">Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredTransactions.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="p-6 text-center text-gray-400">
//                       No transactions found
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredTransactions.map((tx, index) => (
//                     <tr
//                       key={tx._id}
//                       className={`border-b ${
//                         index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                       } hover:bg-gray-100 transition`}
//                     >
//                       <td className="p-4 text-gray-700">
//                         {tx.budgetId?.category || "-"}
//                       </td>

//                       <td className="p-4 text-gray-600 capitalize">
//                         {tx.type}
//                       </td>

//                       <td className="p-4 text-gray-700">{tx.notes || "-"}</td>

//                       <td className="p-4 text-gray-600">
//                         {tx.createdAt
//                           ? new Date(tx.createdAt).toLocaleDateString()
//                           : "-"}
//                       </td>

//                       <td className="p-4 font-medium text-gray-800">
//                         ${tx.amount}
//                       </td>

//                       <td className="flex justify-center gap-2 p-4">
//                         <button
//                           onClick={() => {
//                             setEditTx(tx);
//                             setShowForm(true);
//                           }}
//                           className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
//                         >
//                           Edit
//                         </button>

//                         <button
//                           onClick={() => handleDelete(tx._id)}
//                           className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
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

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");

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

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

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

  const categories = [
    ...new Set(transactions.map((tx) => tx.budgetId?.category).filter(Boolean)),
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterType("");
    setFilterDate("");
  };

  if (loading)
    return (
      <p className="mt-10 text-center text-gray-500">Loading transactions...</p>
    );

  return (
    <div className="min-h-screen p-4 text-gray-800 bg-gray-100 sm:p-6">
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
        <div className="p-4 bg-white border border-gray-200 shadow-sm sm:p-6 rounded-2xl">
          {/* Header */}
          <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between sm:mb-8">
            <h2 className="text-xl font-semibold sm:text-2xl">Transactions</h2>

            <button
              onClick={() => setShowForm(true)}
              className="w-full px-4 py-2 text-white transition bg-gray-900 rounded-lg hover:bg-gray-800 sm:w-auto"
            >
              + Add New
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 text-gray-700 transition border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 md:grid-cols-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
            />

            <button
              onClick={clearFilters}
              className="px-4 py-3 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full min-w-[600px] border-collapse">
              <thead className="text-sm font-medium text-gray-600 border-b bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Notes</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <tr
                      key={tx._id}
                      className={`border-b ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="p-3">{tx.budgetId?.category || "-"}</td>
                      <td
                        className={`p-3 capitalize ${
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
                        className={`p-3 font-medium ${
                          tx.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}${tx.amount}
                      </td>
                      <td className="flex flex-wrap justify-center gap-2 p-3">
                        <button
                          onClick={() => {
                            setEditTx(tx);
                            setShowForm(true);
                          }}
                          className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
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
