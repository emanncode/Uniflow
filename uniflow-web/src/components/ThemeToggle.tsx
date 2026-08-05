"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Default to dark mode
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  if (!mounted) {
    return (
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          background: "var(--bg-hover)",
          border: "1px solid var(--border-primary)",
        }}
      />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        background: "var(--bg-hover)",
        border: "1px solid var(--border-primary)",
        color: "var(--text-primary)",
        cursor: "pointer",
        transition: "border-color 0.2s, background-color 0.2s",
        outline: "none",
      }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {theme === "dark" ? (
          <Sun size={18} className="text-amber-400" />
        ) : (
          <Moon size={18} className="text-indigo-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
