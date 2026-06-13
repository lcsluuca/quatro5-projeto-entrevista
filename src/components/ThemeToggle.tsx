import React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-btn"
      aria-label={theme === "light" ? "Alternar para Modo Escuro" : "Alternar para Modo Claro"}
      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-xs cursor-pointer flex items-center justify-center"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-slate-800 dark:text-slate-350 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
