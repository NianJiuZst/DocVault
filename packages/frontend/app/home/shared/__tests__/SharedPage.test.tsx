import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SharedPage from "../page";

describe("SharedPage", () => {
  it("renders the page header", () => {
    render(<SharedPage />);

    expect(screen.getByText("Shared with Me")).toBeInTheDocument();
    expect(
      screen.getByText("Documents shared by your team members"),
    ).toBeInTheDocument();
  });

  it("renders the search bar", () => {
    render(<SharedPage />);

    expect(
      screen.getByPlaceholderText("Search shared documents..."),
    ).toBeInTheDocument();
  });

  it("renders shared documents with access labels", () => {
    render(<SharedPage />);

    expect(screen.getByText("Q4 Product Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Design System Guidelines")).toBeInTheDocument();
    expect(screen.getAllByText("Edit")).toHaveLength(2);
    expect(screen.getByText("View")).toBeInTheDocument();
  });
});
