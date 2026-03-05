import { useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "mzc-theme";

function getInitialTheme() {
    if (typeof window === "undefined") {
        return "light";
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        const isDark = theme === "dark";

        root.classList.toggle("dark", isDark);
        root.style.colorScheme = isDark ? "dark" : "light";
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            isDark: theme === "dark",
            toggleTheme: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
        }),
        [theme]
    );

    return value;
}
