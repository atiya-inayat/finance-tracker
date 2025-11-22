"use client";
import { useState, useEffect } from "react";

export default function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  // Load stored theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 p-2 bg-gray-200 dark:bg-gray-800 rounded-full shadow-md z-50 transition"
      >
        {darkMode ? "🌙" : "☀️"}
      </button>

      {children}
    </>
  );
}
