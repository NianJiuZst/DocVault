import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import HomePage from "../page";

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
});
