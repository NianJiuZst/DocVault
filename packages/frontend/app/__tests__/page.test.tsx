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
      screen.getByRole("heading", { level: 1, name: "DocVault" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "现代化协同文档编辑器，内置 AI Agent 与 RAG 知识库关联功能",
      ),
    ).toBeInTheDocument();
  });

  it("renders the main feature sections", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 3, name: "编辑器" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "协作编辑" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "知识库" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "模板" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "导入导出" }),
    ).toBeInTheDocument();
  });

  it("renders the mockup and CTA sections", () => {
    render(<HomePage />);

    expect(
      screen.getByText("DocVault 产品发布协作方案"),
    ).toBeInTheDocument();
    expect(screen.getByText("本次发布重点")).toBeInTheDocument();
    expect(screen.getByText("AI Panel")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "立即开始，提升你的文档协作效率",
      }),
    ).toBeInTheDocument();
  });

  it("renders the required navigation and CTA links", () => {
    render(<HomePage />);

    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/auth/signin",
    );
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      "/home/cloud-docs",
    );

    const startLinks = screen.getAllByRole("link", { name: /开始使用/ });
    expect(startLinks).toHaveLength(1);
    expect(startLinks[0]).toHaveAttribute("href", "/home/cloud-docs");
  });
});
