"use client";

import React, { useEffect, useState } from "react";
import { getTransactions } from "@/app/lib/api";

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions(); // wait for backend
        console.log("Fetched transactions:", data); // 👀 check this

        // ensure it’s an array before setting
        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : []
        );
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Date</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-gray-500">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.title}</td>
                <td style={{ color: tx.type === "income" ? "green" : "red" }}>
                  {tx.type === "income" ? "+" : "-"}${tx.amount}
                </td>
                <td>{tx.category}</td>
                <td>{tx.type}</td>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.notes || "-"}</td>
                <td>
                  <button onClick={() => editTransaction(tx._id)}>Edit</button>
                  <button onClick={() => deleteTransaction(tx._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
