import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import FolderTree from "../FolderTree";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const fakeTree = [
  {
    id: 1,
    title: "工作文件夹",
    isFolder: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    children: [
      {
        id: 2,
        title: "文档A",
        isFolder: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
        children: [],
      },
    ],
  },
  {
    id: 3,
    title: "根文档.txt",
    isFolder: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-03T00:00:00.000Z",
    children: [],
  },
];

describe("FolderTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render tree heading", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => fakeTree });
    render(<FolderTree />);
    expect(await screen.findByText("文件")).toBeInTheDocument();
  });

  it("should render folder and document names from API", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => fakeTree });
    render(<FolderTree />);
    await waitFor(() => {
      expect(screen.getByText("工作文件夹")).toBeInTheDocument();
      expect(screen.getByText("根文档.txt")).toBeInTheDocument();
    });
  });

  it("should show loading then hide it", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    const { rerender } = render(<FolderTree />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("加载中...")).not.toBeInTheDocument();
    });
  });

  it("should show empty state when no items", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<FolderTree />);
    await waitFor(() => {
      expect(screen.getByText("暂无文件")).toBeInTheDocument();
    });
  });

  it("should expand folder and show children on click", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => fakeTree });
    render(<FolderTree />);
    const folder = await screen.findByText("工作文件夹");
    await userEvent.click(folder);
    await waitFor(() => {
      expect(screen.getByText("文档A")).toBeInTheDocument();
    });
  });

  it("should collapse folder on second click", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => fakeTree });
    render(<FolderTree />);
    const folder = await screen.findByText("工作文件夹");
    await userEvent.click(folder); // expand
    await waitFor(() => expect(screen.getByText("文档A")).toBeInTheDocument());
    await userEvent.click(folder); // collapse
    await waitFor(() => {
      expect(screen.queryByText("文档A")).not.toBeInTheDocument();
    });
  });

  it("should navigate to document on document click", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => fakeTree });
    const onDocClick = vi.fn();
    render(<FolderTree onDocClick={onDocClick} />);
    const doc = await screen.findByText("根文档.txt");
    await userEvent.click(doc);
    expect(onDocClick).toHaveBeenCalledWith(3);
  });

  it("should show create folder form when + button clicked", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<FolderTree />);
    const addBtn = screen.getByTitle("New folder");
    await userEvent.click(addBtn);
    expect(screen.getByPlaceholderText("Folder name")).toBeInTheDocument();
  });

  it("should call POST /documents/folder and reload on creation", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial load
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // reload after create
    render(<FolderTree />);
    const addBtn = screen.getByTitle("New folder");
    await userEvent.click(addBtn);
    const input = screen.getByPlaceholderText("Folder name");
    await userEvent.type(input, "Test Folder");
    await userEvent.click(screen.getByText("创建"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/documents/folder",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("should close create form on Escape", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<FolderTree />);
    const addBtn = screen.getByTitle("New folder");
    await userEvent.click(addBtn);
    const input = screen.getByPlaceholderText("Folder name");
    await userEvent.type(input, "test{escape}");
    expect(screen.queryByPlaceholderText("Folder name")).not.toBeInTheDocument();
  });
});
