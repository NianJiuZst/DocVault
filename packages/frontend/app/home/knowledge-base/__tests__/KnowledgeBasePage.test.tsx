import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/home/knowledge-base",
}));

import KnowledgeBasePage from "../page";

describe("KnowledgeBasePage", () => {
  it("renders the page header", () => {
    render(<KnowledgeBasePage />);

    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText("Your bookmarked documents")).toBeInTheDocument();
  });

  it("renders the search bar", () => {
    render(<KnowledgeBasePage />);

    expect(screen.getByPlaceholderText("Search favorites...")).toBeInTheDocument();
  });

  it("renders favorite documents", () => {
    render(<KnowledgeBasePage />);

    expect(screen.getByText("TypeScript Best Practices Guide")).toBeInTheDocument();
    expect(screen.getByText("RAG Architecture Deep Dive")).toBeInTheDocument();
    expect(screen.getByText("Next.js Performance Optimization")).toBeInTheDocument();
    expect(screen.getByText("LLM Prompt Engineering Handbook")).toBeInTheDocument();
  });
});
