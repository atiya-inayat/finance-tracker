// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import FloatingAIChat from "../aiChat/page";

// const monthNames = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

// export default function ReportsPage() {
//   const [summary, setSummary] = useState(null);

//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const res = await axios.get(
//           "http://localhost:3005/api/reports/summary",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         setSummary({
//           monthlyTrends: (res.data.monthlyIncomeVsExpenses || []).map((d) => ({
//             month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
//             income: d.income,
//             expenses: d.expenses,
//           })),
//           categoryBreakdown: (res.data.categorySpending || []).map((d) => ({
//             category: d.category,
//             amount: d.total,
//           })),
//           cashFlow: (res.data.cashFlow || []).map((d) => ({
//             month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
//             net: d.netCashFlow,
//           })),
//         });
//       } catch (err) {
//         console.error("Error fetching summary:", err);
//       }
//     };

//     fetchSummary();
//   }, []);

//   if (!summary)
//     return (
//       <p className="mt-10 text-lg text-center text-gray-700">
//         Loading reports...
//       </p>
//     );

//   const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

//   return (
//     <div className="max-w-6xl p-6 mx-auto text-gray-800">
//       <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
//         Financial Reports
//       </h1>

//       {/* Charts Container */}
//       <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
//         {/* Monthly Income vs Expenses */}
//         <div className="p-6 bg-white border border-gray-200 shadow-md rounded-2xl">
//           <h2 className="mb-4 text-xl font-semibold">
//             Monthly Income vs Expenses
//           </h2>
//           <LineChart
//             width={500}
//             height={300}
//             data={summary.monthlyTrends}
//             margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//             <YAxis tick={{ fontSize: 12 }} />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="income" stroke="#4caf50" dot />
//             <Line type="monotone" dataKey="expenses" stroke="#f44336" dot />
//           </LineChart>
//         </div>

//         {/* Category Spending */}
//         <div className="p-6 bg-white border border-gray-200 shadow-md rounded-2xl">
//           <h2 className="mb-4 text-xl font-semibold">Category Spending</h2>
//           <PieChart width={400} height={300}>
//             <Pie
//               data={summary.categoryBreakdown}
//               dataKey="amount"
//               nameKey="category"
//               cx="50%"
//               cy="50%"
//               outerRadius={100}
//               label={({ name, percent, category, amount }) =>
//                 `${category}: $${amount}`
//               }
//             >
//               {summary.categoryBreakdown.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend />
//           </PieChart>
//         </div>

//         {/* Net Cash Flow */}
//         <div className="p-6 bg-white border border-gray-200 shadow-md rounded-2xl md:col-span-2">
//           <h2 className="mb-4 text-xl font-semibold">Net Cash Flow</h2>
//           <LineChart
//             width={1000}
//             height={350}
//             data={summary.cashFlow}
//             margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//             <YAxis tick={{ fontSize: 12 }} />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="net" stroke="#2196f3" dot />
//           </LineChart>
//         </div>
//       </div>

//       <FloatingAIChat />
//     </div>
//   );
// }

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
  ResponsiveContainer,
} from "recharts";
import FloatingAIChat from "../aiChat/page";

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
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          "http://localhost:3005/api/reports/summary",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSummary({
          monthlyTrends: (res.data.monthlyIncomeVsExpenses || []).map((d) => ({
            month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
            income: d.income,
            expenses: d.expenses,
          })),
          categoryBreakdown: (res.data.categorySpending || []).map((d) => ({
            category: d.category,
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

  if (!summary)
    return (
      <p className="mt-10 text-lg text-center text-gray-700">
        Loading reports...
      </p>
    );

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

  return (
    <div className="max-w-6xl p-4 mx-auto text-gray-800 sm:p-6">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
        Financial Reports
      </h1>

      {/* Charts Container */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Monthly Income vs Expenses */}
        <div className="p-6 bg-white border border-gray-200 shadow-md rounded-2xl">
          <h2 className="mb-4 text-xl font-semibold">
            Monthly Income vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={summary.monthlyTrends}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#4caf50" dot />
              <Line type="monotone" dataKey="expenses" stroke="#f44336" dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Spending */}
        <div className="p-6 bg-white border border-gray-200 shadow-md rounded-2xl">
          <h2 className="mb-4 text-xl font-semibold">Category Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summary.categoryBreakdown}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent, category, amount }) =>
                  `${category}: $${amount}`
                }
              >
                {summary.categoryBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Net Cash Flow */}
        <div className="p-6 bg-white border border-gray-200 shadow-md rounded-2xl lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Net Cash Flow</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={summary.cashFlow}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="net" stroke="#2196f3" dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <FloatingAIChat />
    </div>
  );
}
