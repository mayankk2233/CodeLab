"use client";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ? saved === "dark" : prefersDark;
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
    // Dispatch custom event for Monaco Editor to listen
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button onClick={toggle} className="btn text-xs">
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}