import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotesPage from "../page";

describe("NotesPage", () => {
  it("renders the page header", () => {
    render(<NotesPage />);

    expect(screen.getByText("Personal Notes")).toBeInTheDocument();
    expect(screen.getByText("Your private thinking space")).toBeInTheDocument();
  });

  it("renders the New Note button", () => {
    render(<NotesPage />);

    expect(screen.getByText("New Note")).toBeInTheDocument();
  });

  it("renders the search bar", () => {
    render(<NotesPage />);

    expect(screen.getByPlaceholderText("Search notes...")).toBeInTheDocument();
  });

  it("renders sample notes", () => {
    render(<NotesPage />);

    expect(screen.getByText("Meeting Notes - Sprint Planning")).toBeInTheDocument();
    expect(screen.getByText("Quick Thoughts on Auth Flow")).toBeInTheDocument();
    expect(screen.getByText("Book Summary: Atomic Habits")).toBeInTheDocument();
    expect(screen.getByText("Code Review Checklist")).toBeInTheDocument();
  });
});
