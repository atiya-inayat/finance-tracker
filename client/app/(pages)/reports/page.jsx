"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("authToken"); // saved token
        const res = await axios.get(
          "http://localhost:3005/api/reports/summary",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("API Response:", res.data);

        setSummary({
          monthlyTrends: (res.data.monthlyIncomeVsExpenses || []).map((d) => ({
            month: `${monthNames[d._id.month - 1]} ${d._id.year}`, // ✅ fix here
            income: d.income,
            expenses: d.expenses,
          })),
          categoryBreakdown: (res.data.categorySpending || []).map((d) => ({
            category: d._id, // ✅ your backend sends category in _id
            amount: d.total,
          })),
          cashFlow: (res.data.cashFlow || []).map((d) => ({
            month: `${monthNames[d._id.month - 1]} ${d._id.year}`, // ✅ fix here
            net: d.netCashFlow,
          })),
        });

        setSummary({
          monthlyTrends: (res.data.monthlyIncomeVsExpenses || []).map((d) => ({
            month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
            income: d.income,
            expenses: d.expenses,
          })),
          categoryBreakdown: (res.data.categorySpending || []).map((d) => ({
            category: d.category, // ✅ fixed: use category instead of _id
            amount: d.total,
          })),
          cashFlow: (res.data.cashFlow || []).map((d) => ({
            month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
            net: d.netCashFlow,
          })),
        });
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };

    fetchSummary();
  }, []);

  if (!summary) return <p className="text-black text-lg">Loading reports...</p>;

  return (
    <div className="p-6 text-black">
      <h1 className="text-3xl font-bold mb-6">Financial Reports</h1>

      {/* Line Chart - Monthly Income vs Expenses */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Monthly Income vs Expenses
        </h2>
        <LineChart width={700} height={400} data={summary.monthlyTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#4caf50"
            name="Income"
            dot
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#f44336"
            name="Expenses"
            dot
          />
        </LineChart>
      </div>

      {/* Pie Chart - Category Spending */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Category Spending</h2>
        <PieChart width={500} height={400}>
          <Pie
            data={summary.categoryBreakdown}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label={({ category, amount }) => `${category}: ${amount}`}
          >
            {summary.categoryBreakdown.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"][
                    index % 5
                  ]
                }
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Line Chart - Net Cash Flow */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Net Cash Flow</h2>
        <LineChart width={700} height={400} data={summary.cashFlow}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#2196f3"
            name="Net Cash Flow"
            dot
          />
        </LineChart>
      </div>
    </div>
  );
}
