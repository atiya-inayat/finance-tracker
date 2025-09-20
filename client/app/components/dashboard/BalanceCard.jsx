import React from "react";
import Charts from "./Charts";

const BalanceCard = ({ income, expense, balance }) => {
  return (
    <div>
      <div className="grid-cols-3 grid gap-2 mt-5">
        <div className="border-2 border-gray-50 rounded-lg p-4 flex items-center flex-col 	">
          <h3 className="text-black">Total Income </h3>
          <h3 className="text-emerald-700 font-extrabold pt-4">${income}</h3>
        </div>
        <div className="border-2 border-gray-50 rounded-lg p-4 flex items-center flex-col 	">
          <h3 className="text-black">Total Expenses: </h3>
          <h3 className="text-red-700 font-extrabold pt-4">${expense}</h3>
        </div>
        <div className="border-2 border-gray-50 rounded-lg p-4 flex items-center flex-col 	">
          <h3 className="text-black">Current Balance: </h3>
          <h3 className="text-yellow-400 font-extrabold pt-4">${balance}</h3>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
