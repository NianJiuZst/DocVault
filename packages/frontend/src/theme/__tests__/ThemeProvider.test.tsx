import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "../ThemeProvider";
import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("should render with light theme by default", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("light");
  });

  it("should read dark theme from localStorage on mount", () => {
    localStorage.setItem("docvault-theme", "dark");
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(document.documentElement.className).toContain("dark");
  });

  it("should toggle theme to dark when button clicked", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(localStorage.getItem("docvault-theme")).toBe("dark");
    expect(document.documentElement.className).toContain("dark");
  });

  it("should toggle back to light when clicked twice", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("theme-value").textContent).toBe("light");
    expect(localStorage.getItem("docvault-theme")).toBe("light");
  });

  it("should return default context value when used outside provider", () => {
    // useContext returns the default value (light theme, no-op toggle) instead of throwing
    render(<TestComponent />);
    // Default context value is returned: theme=light, toggle is no-op
    expect(screen.getByTestId("theme-value").textContent).toBe("light");
  });
});
