// Light/dark theme helpers. index.html applies the saved theme before first paint;
// these keep <html class="dark">, the theme-color meta and localStorage in sync afterwards.
const THEME_COLORS = { light: "#f6f7fb", dark: "#11152a" };

export function getTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
}
