import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CloudDocsPage from "../page";

describe("CloudDocsPage", () => {
  it("renders the workspace introduction page", () => {
    render(<CloudDocsPage />);

    expect(
      screen.getByText("Programming & AI Workspace"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your intelligent knowledge hub"),
    ).toBeInTheDocument();
  });

  it("renders all feature items", () => {
    render(<CloudDocsPage />);

    expect(
      screen.getByText("Smart document organization with AI-powered categorization"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Real-time collaboration with your team members"),
    ).toBeInTheDocument();
    expect(screen.getByText("Full-text search across all your documents")).toBeInTheDocument();
    expect(
      screen.getByText("RAG-powered knowledge base for instant answers"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("End-to-end encrypted cloud storage"),
    ).toBeInTheDocument();
  });


});
