"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import React from "react";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </NextThemesProvider>
    );
};

// Adapted to match the previous API signature { theme, toggleTheme }
export const useTheme = () => {
    const { theme, setTheme, systemTheme } = useNextTheme();

    // For hydration safety, resolvedTheme handles system preference
    const currentTheme = theme === 'system' ? systemTheme : theme;

    const toggleTheme = () => {
        setTheme(currentTheme === "dark" ? "light" : "dark");
    };

    return {
        theme: currentTheme || "light",
        toggleTheme
    };
};
