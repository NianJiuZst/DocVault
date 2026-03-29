import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TemplateSelectorModal from "../TemplateSelectorModal";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const fakeTemplates = [
  { id: 1, name: "周报模板", category: "weekly_report", isPublic: true, ownerId: 1 },
  { id: 2, name: "会议纪要", category: "meeting_notes", isPublic: true, ownerId: 1 },
];

describe("TemplateSelectorModal", () => {
  let onClose: ReturnType<typeof vi.fn>;
  let onSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    onClose = vi.fn();
    onSelect = vi.fn();
  });

  it("不传 isOpen 时不渲染任何内容", () => {
    const { container } = render(
      <TemplateSelectorModal isOpen={false} onClose={onClose} onSelect={onSelect} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("Should render title and blank document option on open", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<TemplateSelectorModal isOpen={true} onClose={onClose} onSelect={onSelect} />);
    expect(screen.getByText("从模板创建")).toBeInTheDocument();
    expect(screen.getByText("Blank Document")).toBeInTheDocument();
    expect(screen.getByText("创建文档")).toBeInTheDocument();
  });

  it("打开时应请求模板列表并渲染", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => fakeTemplates });
    render(<TemplateSelectorModal isOpen={true} onClose={onClose} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.getByText("周报模板")).toBeInTheDocument();
      // "会议纪要" 同时作为模板名和分类标签，使用 getAllByText 断言至少渲染
      expect(screen.getAllByText("会议纪要").length).toBeGreaterThanOrEqual(1);
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/templates"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  // /** Core scenario: blank document creation */
  it("Default should be blank document, clicking create should call onSelect(null)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<TemplateSelectorModal isOpen={true} onClose={onClose} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.queryByText("正在加载模板...")).not.toBeInTheDocument();
    });

    const createBtn = screen.getByText("创建文档");
    await userEvent.click(createBtn);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("选择模板后点击创建，应调用 onSelect(template)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => fakeTemplates });
    render(<TemplateSelectorModal isOpen={true} onClose={onClose} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.getByText("周报模板")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("周报模板"));
    await userEvent.click(screen.getByText("创建文档"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: "周报模板" }),
    );
  });

  it("Selecting template then switching back to blank should call onSelect(null)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => fakeTemplates });
    render(<TemplateSelectorModal isOpen={true} onClose={onClose} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.getByText("周报模板")).toBeInTheDocument();
    });

    // Select template then switch back to blank document
    await userEvent.click(screen.getByText("周报模板"));
    await userEvent.click(screen.getByText("Blank Document"));
    await userEvent.click(screen.getByText("创建文档"));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("点击取消应调用 onClose", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<TemplateSelectorModal isOpen={true} onClose={onClose} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("取消"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("创建过程中按钮应显示加载状态", async () => {
    // onSelect 返回一个不会立即 resolve 的 Promise，模拟异步创建
    let resolveSelect: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolveSelect = resolve;
    });
    onSelect.mockReturnValueOnce(pendingPromise);

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<TemplateSelectorModal isOpen={true} onClose={onClose} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.queryByText("正在加载模板...")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("创建文档"));

    // 点击后按钮应变为 "创建中..."
    expect(screen.getByText("创建中...")).toBeInTheDocument();

    // resolve 后恢复
    resolveSelect!();
    await waitFor(() => {
      expect(screen.queryByText("创建中...")).not.toBeInTheDocument();
    });
  });

  it("Template load failure should not crash, blank document still creatable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    render(<TemplateSelectorModal isOpen={true} onClose={onClose} onSelect={onSelect} />);
    await waitFor(() => {
      expect(screen.queryByText("正在加载模板...")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("创建文档"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});