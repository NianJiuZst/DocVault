import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CloudDocsPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// mock FolderTree 避免副作用
vi.mock("../FolderTree", () => ({
  default: () => <div data-testid="folder-tree" />,
}));

// mock TemplateSelectorModal 使其可控
const mockOnSelect = vi.fn();
vi.mock("../components/TemplateSelectorModal", () => ({
  default: ({ isOpen, onClose, onSelect }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (t: { id: number; name: string } | null) => Promise<void>;
  }) => {
    // 保存 onSelect 引用以便测试中调用
    mockOnSelect.mockImplementation(onSelect);
    if (!isOpen) return null;
    return (
      <div data-testid="template-modal">
        <button data-testid="select-blank" onClick={() => void onSelect(null)}>
          选空白
        </button>
        <button
          data-testid="select-template"
          onClick={() => void onSelect({ id: 1, name: "周报模板" })}
        >
          选模板
        </button>
        <button data-testid="modal-close" onClick={onClose}>
          关闭
        </button>
      </div>
    );
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

/** 模拟文档列表 API 成功返回 */
const mockListResponse = {
  total: 1,
  page: 1,
  pageSize: 50,
  items: [
    { id: 10, title: "已有文档", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-02T00:00:00.000Z" },
  ],
};

/** 按 URL 模式路由 mock 响应，避免 mockResolvedValueOnce 顺序耗尽 */
function setupFetchMock(overrides: Record<string, Response | (() => Response)> = {}): void {
  mockFetch.mockImplementation((url: string) => {
    for (const [pattern, resp] of Object.entries(overrides)) {
      if (url.includes(pattern)) {
        const resolved = typeof resp === "function" ? resp() : resp;
        return Promise.resolve(resolved);
      }
    }
    // 默认：文档列表请求
    if (url.includes("/documents/list") || url.includes("/documents/shared")) {
      return Promise.resolve({ ok: true, json: async () => mockListResponse });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

describe("CloudDocsPage - 新建文档流程", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFetchMock();
  });

  it("点击新建按钮应打开模板选择弹窗", async () => {
    render(<CloudDocsPage />);
    await waitFor(() => {
      expect(screen.queryByText("加载中...")).not.toBeInTheDocument();
    });

    // 弹窗默认关闭
    expect(screen.queryByTestId("template-modal")).not.toBeInTheDocument();

    // 点击新建
    await userEvent.click(screen.getByText("新建"));

    // 弹窗应打开
    expect(screen.getByTestId("template-modal")).toBeInTheDocument();
  });

  it("选择空白文档应调用 /documents/create 并跳转", async () => {
    const createdDoc = { id: 99 };
    setupFetchMock({
      "/documents/create": { ok: true, json: async () => createdDoc } as Response,
    });

    render(<CloudDocsPage />);
    await waitFor(() => {
      expect(screen.queryByText("加载中...")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("新建"));
    await userEvent.click(screen.getByTestId("select-blank"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/documents/create"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "未命名文档" }),
        }),
      );
      expect(mockPush).toHaveBeenCalledWith("/home/cloud-docs/99");
    });
  });

  it("选择模板应调用 /templates/:id/create-document 并跳转", async () => {
    const createdDoc = { id: 88 };
    setupFetchMock({
      "/templates/": { ok: true, json: async () => createdDoc } as Response,
    });

    render(<CloudDocsPage />);
    await waitFor(() => {
      expect(screen.queryByText("加载中...")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("新建"));
    await userEvent.click(screen.getByTestId("select-template"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/templates/1/create-document"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "周报模板" }),
        }),
      );
      expect(mockPush).toHaveBeenCalledWith("/home/cloud-docs/88");
    });
  });

  it("创建文档失败应显示错误提示", async () => {
    setupFetchMock({
      "/documents/create": { ok: false, status: 500 } as Response,
    });

    render(<CloudDocsPage />);
    await waitFor(() => {
      expect(screen.queryByText("加载中...")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("新建"));
    await userEvent.click(screen.getByTestId("select-blank"));

    await waitFor(() => {
      expect(screen.getByText("创建文档失败，请稍后重试")).toBeInTheDocument();
    });
    // 不应跳转
    expect(mockPush).not.toHaveBeenCalled();
  });
});