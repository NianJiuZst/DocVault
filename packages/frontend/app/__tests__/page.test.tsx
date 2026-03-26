import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import HomePage from "../page";

// Mock BackgroundParticles to avoid canvas/getContext not supported in jsdom
vi.mock("../../components/BackgroundParticles", () => ({
  default: vi.fn(() => null),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("HomePage", () => {
  it("should render the page title", () => {
    render(<HomePage />);
    expect(screen.getByText("DocVault")).toBeInTheDocument();
  });

  it("should render the subtitle", () => {
    render(<HomePage />);
    expect(screen.getByText("现代化协同文档编辑器")).toBeInTheDocument();
  });

  it("should render all three feature cards", () => {
    render(<HomePage />);
    expect(screen.getByText("AI 知识协同")).toBeInTheDocument();
    expect(screen.getByText("实时协作编辑")).toBeInTheDocument();
    expect(screen.getByText("知识库联动")).toBeInTheDocument();
  });

  it("should render CTA button", () => {
    render(<HomePage />);
    expect(screen.getByRole("button", { name: /开始使用/i })).toBeInTheDocument();
  });

  it("should navigate to /home/cloud-docs on CTA click", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(screen.getByRole("button"));
    expect(mockPush).toHaveBeenCalledWith("/home/cloud-docs");
  });

  it("should render feature card descriptions", () => {
    render(<HomePage />);
    expect(screen.getByText(/创作 — 沉淀 — 复用/)).toBeInTheDocument();
    expect(screen.getByText(/Yjs CRDT/)).toBeInTheDocument();
    expect(screen.getByText(/RAG/)).toBeInTheDocument();
  });
});
