"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {
  const [theme, setTheme] = useState("light");

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
    <nav className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* LEFT — LOGO ONLY */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        FinTrack
      </h1>

      {/* RIGHT — LINKS + TOGGLE */}
      <div className="flex items-center space-x-8 text-gray-700 dark:text-gray-300 font-medium">
        <NavLink href="/dashboard" label="Dashboard" />
        <NavLink href="/transactions" label="Transactions" />
        <NavLink href="/budgetTracker" label="Budget" />
        <NavLink href="/reports" label="Reports" />
        <NavLink href="/profile" label="Profile" />

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:scale-110 transition-transform shadow-sm"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-400" />
          )}
        </button>
      </div>
    </nav>
  );
};

const NavLink = ({ href, label }) => (
  <Link
    href={href}
    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
  >
    {label}
  </Link>
);

export default Navbar;
