"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TreeNode {
  id: number;
  title: string;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
  children: TreeNode[];
}

interface FolderTreeProps {
  onDocClick?: (id: number) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function FolderTree({ onDocClick }: FolderTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderParent, setNewFolderParent] = useState<number | undefined>(undefined);
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/documents/tree`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch tree");
      const data: TreeNode[] = await res.json();
      setTree(data);
    } catch {
      // Silently fail — sidebar is non-critical
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDocClick = (id: number) => {
    if (onDocClick) onDocClick(id);
    else router.push(`/home/cloud-docs/${id}`);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreateError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/documents/folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newFolderName.trim(),
          parentId: newFolderParent,
        }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      setNewFolderName("");
      setCreatingFolder(false);
      setNewFolderParent(undefined);
      fetchTree();
    } catch {
      setCreateError("Failed to create folder, please try again");
    }
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.id);

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center gap-1.5 py-1.5 px-2 rounded hover:bg-gray-100 cursor-pointer group transition-colors"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() =>
            node.isFolder ? toggleExpand(node.id) : handleDocClick(node.id)
          }
        >
          {node.isFolder ? (
            <>
              <svg
                className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </>
          )}
          <span className={`text-sm truncate ${node.isFolder ? "font-medium text-gray-700" : "text-gray-600"}`}>
            {node.title}
          </span>
        </div>

        {node.isFolder && isExpanded && node.children.length > 0 && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-56 border-r border-gray-200 bg-gray-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">文件</span>
        <button
          onClick={() => {
            setCreatingFolder(true);
            setNewFolderParent(undefined);
            setNewFolderName("");
          }}
          title="New folder"
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Create folder inline form */}
      {creatingFolder && (
        <div className="px-3 py-2 border-b border-gray-200 bg-white">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") setCreatingFolder(false);
            }}
            placeholder="Folder name"
            className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-1"
          />
          {createError && <p className="text-xs text-red-500 mb-1">{createError}</p>}
          <div className="flex gap-1">
            <button
              onClick={handleCreateFolder}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              创建
            </button>
            <button
              onClick={() => setCreatingFolder(false)}
              className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="text-xs text-gray-400 text-center py-4">加载中...</div>
        ) : tree.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4 px-4">
            暂无文件
          </div>
        ) : (
          tree.map((node) => renderNode(node))
        )}
      </div>
    </div>
  );
}
