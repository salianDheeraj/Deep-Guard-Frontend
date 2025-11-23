"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function ThemeToggleButton({ className }: { className?: string }) {
  // Call hooks in the same order every render: useTheme must be called
  // unconditionally to avoid Rules of Hooks violations.
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid rendering visual bits until mounted to prevent SSR hydration mismatch
  if (!mounted) return null;

  return (
    <div
      className={twMerge(
        "flex items-center justify-center",
        className
      )}
    >
      <button
        onClick={toggleTheme}
        className={clsx(
          "relative flex h-12 w-24 cursor-pointer items-center rounded-full p-1 shadow-inner transition-colors duration-500 overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-400/20",
          isDark ? "bg-slate-800" : "bg-cyan-400"
        )}
        aria-label="Toggle Theme"
      >
        {/* --- BACKGROUND ELEMENTS --- */}

        {/* Stars (Visible only in Dark Mode) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Star 1 */}
          <motion.div
            className="absolute top-2 right-8 text-white"
            initial={false}
            animate={{
              opacity: isDark ? 1 : 0,
              y: isDark ? 0 : 10,
              scale: isDark ? 1 : 0
            }}
            transition={{ duration: 0.4 }}
          >
            <StarIcon className="h-2 w-2" />
          </motion.div>
          {/* Star 2 */}
          <motion.div
            className="absolute top-5 right-4 text-white"
            initial={false}
            animate={{
              opacity: isDark ? 1 : 0,
              y: isDark ? 0 : 10,
              scale: isDark ? 0.8 : 0
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StarIcon className="h-3 w-3" />
          </motion.div>
          {/* Star 3 */}
          <motion.div
            className="absolute bottom-3 right-10 text-white"
            initial={false}
            animate={{
              opacity: isDark ? 1 : 0,
              y: isDark ? 0 : 10,
              scale: isDark ? 0.6 : 0
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StarIcon className="h-2 w-2" />
          </motion.div>
        </div>

        {/* Clouds (Visible only in Light Mode) */}
        <motion.div
          className="absolute bottom-[-5px] left-2 z-0 text-white opacity-80"
          initial={false}
          animate={{
            y: isDark ? 20 : 0,
            opacity: isDark ? 0 : 0.9
          }}
          transition={{ duration: 0.4 }}
        >
          <CloudIcon className="h-8 w-14" />
        </motion.div>

        {/* --- THE TOGGLE HANDLE (SUN / MOON) --- */}
        <motion.div
          className="relative z-10 h-10 w-10 rounded-full shadow-md"
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          animate={{
            x: isDark ? 48 : 0, // Slide distance
            backgroundColor: isDark ? "#cbd5e1" : "#facc15" // Slate-300 (Moon) vs Yellow-400 (Sun)
          }}
        >
          {/* Moon Craters (Only visible in Dark Mode) */}
          <motion.div
            className="absolute top-2 right-3 h-2 w-2 rounded-full bg-slate-400"
            animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 }}
          />
          <motion.div
            className="absolute bottom-3 right-4 h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 }}
            transition={{ delay: 0.1 }}
          />
          <motion.div
            className="absolute bottom-2 left-3 h-1 w-1 rounded-full bg-slate-400"
            animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 }}
            transition={{ delay: 0.2 }}
          />
        </motion.div>
      </button>
    </div>
  );
}

// --- SVG HELPERS ---

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.5 13.5C3.57 13.5 2 15.07 2 17C2 18.93 3.57 20.5 5.5 20.5H18.5C20.43 20.5 22 18.93 22 17C22 15.07 20.43 13.5 18.5 13.5C18.35 13.5 18.2 13.51 18.06 13.52C17.71 10.74 15.36 8.5 12.5 8.5C9.94 8.5 7.78 10.28 7.11 12.66C6.64 12.56 6.15 12.5 5.65 12.5L5.5 13.5Z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
    </svg>
  );
}