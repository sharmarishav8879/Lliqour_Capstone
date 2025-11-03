"use client";
import { createContext, useEffect, useState, useContext } from "react";

const ThemeContext = createContext();

export const ThemeToggle = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // ✅ Load stored theme
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    // ✅ Apply both `data-theme` (for CSS) and `dark` class (for Tailwind dark mode)
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setIsMounted(true);
  }, []);

  const toggleMode = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // ✅ Sync both theme attributes
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!isMounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
