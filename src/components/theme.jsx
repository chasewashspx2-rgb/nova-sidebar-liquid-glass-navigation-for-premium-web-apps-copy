import * as React from "react";

const KEY = "fundflow-theme";

function applyTheme(t) {
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function useTheme() {
  const [theme, setTheme] = React.useState("light");

  React.useEffect(() => {
    const stored = (typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null);
    const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
    const initial = stored ?? (systemDark ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = React.useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      window.localStorage.setItem(KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}