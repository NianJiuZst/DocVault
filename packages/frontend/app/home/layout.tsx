"use client";
import { type ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import { ThemeProvider, useTheme } from "@/src/theme/ThemeProvider";
import { FiSun } from "react-icons/fi";
import { BsMoon } from "react-icons/bs";
import SearchBar from "../../components/SearchBar";
import TemplateSelectorModal from "./cloud-docs/components/TemplateSelectorModal";
import {
  MdSpaceDashboard,
  MdLibraryBooks,
  MdEditNote,
  MdGroup,
  MdExtension,
  MdStar,
  MdSettings,
  MdHelp,
  MdAdd,
  MdChevronRight,
  MdChevronLeft,
  MdAutoAwesome,
  MdPsychology,
  MdAttachFile,
  MdImage,
  MdFolder,
  MdDescription,
} from "react-icons/md";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <BsMoon className="text-gray-600 w-5 h-5" />
      ) : (
        <FiSun className="text-yellow-400 w-5 h-5" />
      )}
    </button>
  );
}

interface TreeNode {
  id: number;
  title: string;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
  children: TreeNode[];
}

function FolderTreeInline({
  onDocClick,
}: {
  onDocClick?: (id: number) => void;
}) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/documents/tree", {
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
      const res = await fetch("http://localhost:3001/documents/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newFolderName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      setNewFolderName("");
      setCreatingFolder(false);
      fetchTree();
    } catch {
      setCreateError("Failed to create folder, please try again");
    }
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.id);
    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer group transition-colors hover:bg-white/40"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() =>
            node.isFolder ? toggleExpand(node.id) : handleDocClick(node.id)
          }
        >
          {node.isFolder ? (
            <>
              <MdChevronRight
                size={12}
                className={`flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                style={{ color: "#444653" }}
              />
              <MdFolder size={16} className="flex-shrink-0" style={{ color: "#444653" }} />
            </>
          ) : (
            <>
              <span className="w-3" />
              <MdDescription size={16} className="flex-shrink-0" style={{ color: "#0043b5" }} />
            </>
          )}
          <span
            className="text-sm truncate"
            style={{
              color: node.isFolder ? "#131b2e" : "#444653",
              fontWeight: node.isFolder ? 500 : 400,
              fontFamily: "Inter, sans-serif",
            }}
          >
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
    <div className="py-2">
      {/* Create folder inline */}
      {creatingFolder && (
        <div className="px-3 py-2 mx-2 mb-2 rounded-xl" style={{ background: "rgba(255,255,255,0.7)" }}>
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") setCreatingFolder(false);
            }}
            placeholder="Folder name"
            className="w-full text-xs px-2 py-1.5 rounded-lg border mb-1.5 outline-none"
            style={{ borderColor: "rgba(195,198,215,0.3)", color: "#131b2e" }}
          />
          {createError && <p className="text-xs text-red-500 mb-1">{createError}</p>}
          <div className="flex gap-1">
            <button
              onClick={handleCreateFolder}
              className="text-xs px-2 py-1 rounded-lg text-white"
              style={{ background: "#0043b5" }}
            >
              Create
            </button>
            <button
              onClick={() => setCreatingFolder(false)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ color: "#444653" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="px-2">
        {loading ? (
          <div className="text-xs text-center py-3" style={{ color: "#444653", opacity: 0.5 }}>
            Loading...
          </div>
        ) : tree.length === 0 ? (
          <div className="text-xs text-center py-3 px-4" style={{ color: "#444653", opacity: 0.5 }}>
            No files yet
          </div>
        ) : (
          tree.map((node) => renderNode(node))
        )}
      </div>

      {/* New folder button */}
      <button
        onClick={() => { setCreatingFolder(true); setNewFolderName(""); }}
        className="flex items-center gap-2 w-full px-3 py-1.5 mt-1 rounded-lg text-xs transition-colors hover:bg-white/30"
        style={{ color: "#444653" }}
      >
        <MdAdd size={14} />
        <span>New folder</span>
      </button>
    </div>
  );
}

export default function HomeLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  // Determine which nav is active
  const isWorkspace =
    pathname === "/home/cloud-docs" || pathname.startsWith("/home/cloud-docs/");
  const isKnowledgeBase = pathname.startsWith("/home/knowledge-base");
  const isNotes = pathname.startsWith("/home/notes");
  const isShared = pathname.startsWith("/home/shared");
  const isPlugins = pathname.startsWith("/home/plugins");

  const handleDocClick = (id: number) => {
    router.push(`/home/cloud-docs/${id}`);
  };

  const navItems = [
    {
      icon: <MdSpaceDashboard size={20} />,
      label: "Workspace",
      active: isWorkspace,
      expandable: true,
      expanded: workspaceExpanded,
      onToggle: () => setWorkspaceExpanded((v) => !v),
    },
    {
      icon: <MdStar size={20} />,
      label: "Favorites",
      href: "/home/knowledge-base",
      active: isKnowledgeBase,
    },
    {
      icon: <MdEditNote size={20} />,
      label: "Personal Notes",
      href: "/home/notes",
      active: isNotes,
    },
    {
      icon: <MdGroup size={20} />,
      label: "Shared Docs",
      href: "/home/shared",
      active: isShared,
    },
    {
      icon: <MdExtension size={20} />,
      label: "Plugins",
      href: "/home/plugins",
      active: isPlugins,
    },
  ];

  const breadcrumbLabel = isWorkspace
    ? "Workspace"
    : isKnowledgeBase
    ? "Favorites"
    : isNotes
    ? "Personal Notes"
    : isShared
    ? "Shared Docs"
    : isPlugins
    ? "Plugins"
    : "Workspace";

  return (
    <ThemeProvider>
      <div
        className="flex h-screen w-full overflow-hidden"
        style={{ background: "#faf8ff", color: "#191b23" }}
      >
        {/* ============================================
            Left Sidebar (256px fixed)
            ============================================ */}
        <aside
          className="w-64 flex-shrink-0 flex flex-col h-full overflow-hidden"
          style={{ background: "#f2f3ff", borderRight: "1px solid rgba(195, 198, 215, 0.3)" }}
        >
          {/* Logo */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0043b5, #145ae2)" }}
              >
                <MdAutoAwesome size={20} />
              </div>
              <div>
                <h1
                  className="font-bold leading-tight"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "1rem", color: "#131b2e" }}
                >
                  DocVault
                </h1>
                <p className="text-xs font-medium" style={{ color: "#444653" }}>
                  Premium Plan
                </p>
              </div>
            </div>
          </div>

          {/* New Button */}
          <div className="px-3 mb-2">
            <button
              onClick={() => setNewModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold transition-all hover:shadow-sm"
              style={{
                background: "#0043b5",
                color: "#ffffff",
                fontFamily: "Manrope, sans-serif",
                fontSize: "0.875rem",
                boxShadow: "0 4px 12px rgba(0, 67, 181, 0.25)",
              }}
            >
              <MdAdd size={18} />
              <span>New</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg mb-0.5 transition-colors"
                    style={
                      item.active
                        ? {
                            background: "rgba(255,255,255,0.5)",
                            color: "#3E5CCB",
                            fontWeight: 700,
                          }
                        : { color: "#131b2e", opacity: 0.8 }
                    }
                  >
                    <span className={item.active ? "text-[#3E5CCB]" : ""}>{item.icon}</span>
                    <span
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem", fontWeight: item.active ? 700 : 500 }}
                    >
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <button
                    onClick={item.onToggle}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-0.5 transition-colors text-left"
                    style={
                      item.active
                        ? {
                            background: "rgba(255,255,255,0.5)",
                            color: "#3E5CCB",
                            fontWeight: 700,
                          }
                        : { color: "#131b2e", opacity: 0.8 }
                    }
                  >
                    <MdChevronRight
                      size={16}
                      className={`transition-transform flex-shrink-0 ${item.expanded ? "rotate-90" : ""}`}
                      style={{ color: item.active ? "#3E5CCB" : "#444653" }}
                    />
                    <span className={item.active ? "text-[#3E5CCB]" : ""}>{item.icon}</span>
                    <span
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem", fontWeight: item.active ? 700 : 500 }}
                    >
                      {item.label}
                    </span>
                  </button>
                )}

                {/* Workspace: show folder tree when expanded */}
                {item.label === "Workspace" && item.expanded && (
                  <div className="mt-1 mb-2">
                    <FolderTreeInline onDocClick={handleDocClick} />
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 mt-auto space-y-1 border-t" style={{ borderColor: "rgba(195, 198, 215, 0.2)" }}>
            {[
              { icon: <MdSettings size={18} />, label: "Settings" },
              { icon: <MdHelp size={18} />, label: "Help" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-2 opacity-80 hover:opacity-100 cursor-pointer transition-opacity rounded-lg"
              >
                {item.icon}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ============================================
            Middle Content Area
            ============================================ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header
            className="flex items-center px-6 flex-shrink-0"
            style={{
              height: "4rem",
              background: "#faf8ff",
              borderBottom: "1px solid rgba(195, 198, 215, 0.3)",
            }}
          >
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm" style={{ color: "#444653", opacity: 0.6 }}>
                {breadcrumbLabel}
              </span>
              {pathname !== "/home/cloud-docs" && !pathname.startsWith("/home/cloud-docs/") && (
                <>
                  <MdChevronRight size={14} style={{ opacity: 0.3 }} />
                  <span className="text-sm font-medium" style={{ color: "#131b2e" }}>
                    {user?.name || "DocVault"}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <div className="w-56" style={{ marginRight: "30px" }}>
                <SearchBar />
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
            {modal}
          </main>
        </div>

        {/* ============================================
            Right AI Panel (380px, collapsible)
            ============================================ */}
        <aside
          className="flex flex-col h-full overflow-hidden transition-all duration-300"
          style={{
            width: rightPanelOpen ? "380px" : "0px",
            background: "#f2f3ff",
            borderLeft: rightPanelOpen ? "1px solid rgba(195, 198, 215, 0.3)" : "none",
            flexShrink: 0,
          }}
        >
          {rightPanelOpen && (
            <div className="flex flex-col h-full w-[380px]">
              {/* Panel Header */}
              <div
                className="flex items-center justify-between p-6"
                style={{ borderBottom: "1px solid rgba(195, 198, 215, 0.2)" }}
              >
                <div className="flex items-center gap-2">
                  <MdAutoAwesome size={18} style={{ color: "#0043b5" }} />
                  <h3
                    className="font-bold"
                    style={{ fontFamily: "Manrope, sans-serif", fontSize: "0.9rem", color: "#131b2e" }}
                  >
                    DocVault Assistant
                  </h3>
                </div>
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="p-2 rounded-full hover:bg-white/50 transition-colors"
                >
                  <MdChevronRight size={18} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-none text-sm shadow-sm"
                    style={{ background: "#0043b5", color: "#ffffff" }}
                  >
                    Summarize our research on persistence
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#444653", opacity: 0.6 }}>
                    Just now
                  </span>
                </div>

                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "#ffdbc8", color: "#321300" }}
                    >
                      <MdPsychology size={14} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#444653" }}>
                      DocVault AI
                    </span>
                  </div>
                  <div
                    className="p-4 rounded-2xl rounded-tl-none max-w-[95%] shadow-sm"
                    style={{ background: "#ffffff", border: "1px solid rgba(195, 198, 215, 0.2)" }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: "#131b2e" }}>
                      Based on your workspace, here are the key findings from your
                      programming & AI knowledge base:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm" style={{ color: "#444653" }}>
                      <li className="flex gap-2">
                        <span className="font-bold" style={{ color: "#0043b5" }}>1.</span>
                        <span>RAG architecture enables real-time document retrieval.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold" style={{ color: "#0043b5" }}>2.</span>
                        <span>TypeScript generics improve type safety in AI pipelines.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-6" style={{ borderTop: "1px solid rgba(195, 198, 215, 0.2)" }}>
                <div
                  className="flex items-center rounded-2xl p-2 gap-2"
                  style={{ background: "#ffffff", border: "1px solid rgba(195, 198, 215, 0.3)" }}
                >
                  <input
                    type="text"
                    placeholder="Ask anything about your notes..."
                    className="flex-1 bg-transparent border-none outline-none px-2 text-sm"
                    style={{ color: "#131b2e" }}
                  />
                  <button
                    className="p-2 rounded-xl transition-opacity hover:opacity-80"
                    style={{ background: "#0043b5", color: "#ffffff" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4 px-1">
                  <div className="flex items-center gap-3">
                    <button className="opacity-50 hover:opacity-100 transition-opacity">
                      <MdAttachFile size={18} />
                    </button>
                    <button className="opacity-50 hover:opacity-100 transition-opacity">
                      <MdImage size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[0.65rem] font-bold uppercase"
                      style={{ color: "#444653", opacity: 0.4 }}
                    >
                      Model: GPT-4o
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Toggle button when panel is closed */}
        {!rightPanelOpen && (
          <button
            onClick={() => setRightPanelOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-l-lg shadow-md"
            style={{ background: "#f2f3ff", border: "1px solid rgba(195, 198, 215, 0.3)" }}
          >
            <MdChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* New Document Modal */}
      <TemplateSelectorModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onSelect={(template) => {
          setNewModalOpen(false);
          if (!template) {
            // Blank document
            router.push(`/home/cloud-docs/new`);
          }
        }}
      />
    </ThemeProvider>
  );
}
