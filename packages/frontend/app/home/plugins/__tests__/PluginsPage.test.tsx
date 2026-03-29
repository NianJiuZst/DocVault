import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PluginsPage from "../page";

describe("PluginsPage", () => {
  it("renders the page header", () => {
    render(<PluginsPage />);

    expect(screen.getByText("Plugins")).toBeInTheDocument();
    expect(
      screen.getByText("Extend DocVault with powerful integrations"),
    ).toBeInTheDocument();
  });

  it("renders the Browse Plugins button", () => {
    render(<PluginsPage />);

    expect(screen.getByText("Browse Plugins")).toBeInTheDocument();
  });

  it("renders plugin list with installed/not installed badges", () => {
    render(<PluginsPage />);

    expect(screen.getByText("GitHub Integration")).toBeInTheDocument();
    expect(screen.getByText("Notion Import")).toBeInTheDocument();
    expect(screen.getAllByText("Installed")).toHaveLength(2);
    expect(screen.getAllByText("Not installed")).toHaveLength(2);
  });
});
