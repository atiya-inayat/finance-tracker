// import Link from "next/link";
// import React from "react";

// const Navbar = () => {
//   return (
//     <div>
//       <div>
//         <h1>FinTrack</h1>
//       </div>
//       <div>
//         <Link href="/dashboard">Dashboard</Link>
//         <Link href="/transactions">Transactions</Link>
//         <Link href="/budgetTracker">Budget</Link>
//         <Link href="/reports">Report</Link>
//       </div>
//     </div>
//   );
// };

// export default Navbar;
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo / Brand */}
      <div>
        <h1 className="text-2xl font-bold text-blue-600">FinTrack</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-6 text-gray-700 font-medium">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 transition duration-200"
        >
          Dashboard
        </Link>
        <Link
          href="/transactions"
          className="hover:text-blue-600 transition duration-200"
        >
          Transactions
        </Link>
        <Link
          href="/budgetTracker"
          className="hover:text-blue-600 transition duration-200"
        >
          Budget
        </Link>
        <Link
          href="/reports"
          className="hover:text-blue-600 transition duration-200"
        >
          Report
        </Link>
        <Link
          href="/profile"
          className="hover:text-blue-600 transition duration-200"
        >
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
