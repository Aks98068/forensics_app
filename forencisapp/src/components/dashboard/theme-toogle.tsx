"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("forensiq-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const initialTheme: Theme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : prefersDark
          ? "dark"
          : "light";

    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark",
    );

    document.documentElement.style.colorScheme = initialTheme;
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark",
    );

    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("forensiq-theme", nextTheme);
    setTheme(nextTheme);
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle color theme"
        className="rounded-xl border border-stone-300 p-2.5 text-stone-700 dark:border-white/15 dark:text-stone-200"
      >
        <Sun size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="rounded-xl border border-stone-300 bg-white p-2.5 text-stone-700 transition-colors hover:bg-stone-100 dark:border-white/15 dark:bg-[#24272D] dark:text-stone-100 dark:hover:bg-[#30343B]"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
