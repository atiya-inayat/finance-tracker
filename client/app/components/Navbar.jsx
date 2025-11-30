// "use client";

// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import { Sun, Moon } from "lucide-react";

// const Navbar = () => {
//   const [theme, setTheme] = useState("light");

//   useEffect(() => {
//     const saved = localStorage.getItem("theme") || "light";
//     setTheme(saved);
//     document.documentElement.classList.toggle("dark", saved === "dark");
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === "light" ? "dark" : "light";
//     setTheme(newTheme);
//     localStorage.setItem("theme", newTheme);
//     document.documentElement.classList.toggle("dark", newTheme === "dark");
//   };

//   return (
//     <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/70 dark:bg-gray-900/70 dark:border-gray-800">
//       {/* LEFT — LOGO ONLY */}
//       <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
//         FinTrack
//       </h1>

//       {/* RIGHT — LINKS + TOGGLE */}
//       <div className="flex items-center space-x-8 font-medium text-gray-700 dark:text-gray-300">
//         <NavLink href="/dashboard" label="Dashboard" />
//         <NavLink href="/transactions" label="Transactions" />
//         <NavLink href="/budgetTracker" label="Budget" />
//         <NavLink href="/reports" label="Reports" />
//         <NavLink href="/profile" label="Profile" />

//         {/* THEME TOGGLE */}
//         <button
//           onClick={toggleTheme}
//           className="p-2 transition-transform bg-gray-100 border border-gray-300 rounded-full shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:scale-110"
//         >
//           {theme === "light" ? (
//             <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
//           ) : (
//             <Sun className="w-5 h-5 text-yellow-400" />
//           )}
//         </button>
//       </div>
//     </nav>
//   );
// };

// const NavLink = ({ href, label }) => (
//   <Link
//     href={href}
//     className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
//   >
//     {label}
//   </Link>
// );

// export default Navbar;

"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";

const Navbar = () => {
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/70 dark:bg-gray-900/70 dark:border-gray-800 sm:px-8">
      {/* LEFT — LOGO */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        FinTrack
      </h1>

      {/* MOBILE — HAMBURGER BUTTON */}
      <div className="flex items-center sm:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 transition-transform bg-gray-100 border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:scale-110"
        >
          {menuOpen ? (
            <X className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          ) : (
            <Menu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          )}
        </button>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 ml-2 transition-transform bg-gray-100 border border-gray-300 rounded-full shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:scale-110"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-400" />
          )}
        </button>
      </div>

      {/* DESKTOP — LINKS + THEME TOGGLE */}
      <div className="items-center hidden space-x-8 font-medium text-gray-700 sm:flex dark:text-gray-300">
        <NavLink href="/dashboard" label="Dashboard" />
        <NavLink href="/transactions" label="Transactions" />
        <NavLink href="/budgetTracker" label="Budget" />
        <NavLink href="/reports" label="Reports" />
        <NavLink href="/profile" label="Profile" />

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 transition-transform bg-gray-100 border border-gray-300 rounded-full shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:scale-110"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-400" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="absolute left-0 w-full bg-white border-t border-gray-200 shadow-md top-full dark:bg-gray-900 dark:border-gray-800 sm:hidden">
          <div className="flex flex-col items-center py-4 space-y-4 font-medium text-gray-700 dark:text-gray-300">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/transactions" label="Transactions" />
            <NavLink href="/budgetTracker" label="Budget" />
            <NavLink href="/reports" label="Reports" />
            <NavLink href="/profile" label="Profile" />
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, label }) => (
  <Link
    href={href}
    className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
  >
    {label}
  </Link>
);

export default Navbar;
