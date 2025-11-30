// import React from "react";
// import Charts from "./Charts";

// const BalanceCard = ({ income, expense, balance }) => {
//   return (
//     <div>
//       <div className="grid grid-cols-3 gap-2 mt-5">
//         <div className="flex flex-col items-center p-4 border-2 rounded-lg border-gray-50 ">
//           <h3 className="text-black">Total Income </h3>
//           <h3 className="pt-4 font-extrabold text-emerald-700">${income}</h3>
//         </div>
//         <div className="flex flex-col items-center p-4 border-2 rounded-lg border-gray-50 ">
//           <h3 className="text-black">Total Expenses: </h3>
//           <h3 className="pt-4 font-extrabold text-red-700">${expense}</h3>
//         </div>
//         <div className="flex flex-col items-center p-4 border-2 rounded-lg border-gray-50 ">
//           <h3 className="text-black">Current Balance: </h3>
//           <h3 className="pt-4 font-extrabold text-yellow-400">${balance}</h3>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BalanceCard;
export default function BalanceCard({ income, expense, balance }) {
  const cards = [
    { label: "Income", value: income, color: "text-green-600" },
    { label: "Expense", value: expense, color: "text-red-600" },
    { label: "Balance", value: balance, color: "text-blue-600" },
  ];

  return cards.map((item, index) => (
    <div
      key={index}
      className="p-6 transition bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md"
    >
      <p className="text-sm text-gray-500">{item.label}</p>
      <p className={`mt-2 text-2xl font-semibold ${item.color}`}>
        {item.value}
      </p>
    </div>
  ));
}
