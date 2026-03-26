import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import WaveArrow from "../WaveArrow";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("WaveArrow", () => {
  it("should render start text label", () => {
    render(<WaveArrow />);
    expect(screen.getByText("开始使用")).toBeInTheDocument();
  });

  it("should render SVG wave element", () => {
    render(<WaveArrow />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should navigate to /home/cloud-docs on click when no onClick provided", async () => {
    const user = userEvent.setup();
    render(<WaveArrow />);
    await user.click(screen.getByRole("button"));
    expect(mockPush).toHaveBeenCalledWith("/home/cloud-docs");
  });

  it("should render without crashing when onClick prop is provided", () => {
    render(<WaveArrow onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should be accessible as a button with proper label", () => {
    render(<WaveArrow />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "开始使用");
  });
});
