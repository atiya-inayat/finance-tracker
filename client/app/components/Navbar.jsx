import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div>
      <div>
        <h1>FinTrack</h1>
      </div>
      <div>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/transactions">Transactions</Link>
        <Link href="/budgetTracker">Budget</Link>
        <Link href="/reports">Report</Link>
      </div>
    </div>
  );
};

export default Navbar;
