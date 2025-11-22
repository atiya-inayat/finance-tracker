import TransactionManager from "@/app/components/transactions/TransactionTable";
import React from "react";
import FloatingAIChat from "../aiChat/page";

const Transactions = () => {
  return (
    <div>
      <TransactionManager />
      <FloatingAIChat />
    </div>
  );
};

export default Transactions;
