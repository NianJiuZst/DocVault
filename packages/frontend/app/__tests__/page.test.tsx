import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "../page";

vi.mock("next/font/google", () => ({
  Inter: () => ({ className: "mock-font", variable: "mock-font-inter" }),
  Manrope: () => ({ className: "mock-font", variable: "mock-font-manrope" }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("HomePage", () => {
  it("renders the hero headline", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Your Entire Workspace/)).toBeInTheDocument();
  });

  it("renders the features section", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Engineered for Focus" }),
    ).toBeInTheDocument();
    expect(screen.getByText("The Ultimate Editor")).toBeInTheDocument();
    expect(screen.getByText("AI Knowledge Engine (RAG)")).toBeInTheDocument();
    expect(screen.getByText("Infinite Extensibility")).toBeInTheDocument();
  });

  it("renders the CTA section", () => {
    render(<HomePage />);

    expect(
      screen.getByText("Ready to transform your productivity?"),
    ).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<HomePage />);

    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/auth/signin",
    );
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/home/cloud-docs",
    );
    expect(
      screen.getByRole("link", { name: "Start Writing for Free" }),
    ).toHaveAttribute("href", "/home/cloud-docs");
  });
});
