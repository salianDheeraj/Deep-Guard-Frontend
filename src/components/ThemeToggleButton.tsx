"use client";
import { useTheme } from "../app/theme-provider";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-lg bg-gray-800 text-white dark:bg-yellow-300 dark:text-black transition-all"
    >
      {theme === "light" ? "Dark Mode 🌙" : "Light Mode ☀️"}
    </button>
  );
}
