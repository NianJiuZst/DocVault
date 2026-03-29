"use client";
import { VscNewFile } from "react-icons/vsc";
import { IoCloudUploadOutline } from "react-icons/io5";
import { CgTemplate } from "react-icons/cg";
import { useState, useEffect, useCallback } from "react";
import { FaRegFileAlt, FaRegTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import FolderTree from "./FolderTree";
import TemplateSelectorModal from "./components/TemplateSelectorModal";

interface DocumentItem {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: DocumentItem[];
}

type TabType = "recent" | "shared" | "favorites";

interface SharedDocItem extends DocumentItem {
  permission: string;
}

interface TreeNode {
  id: number;
  title: string;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
  children: TreeNode[];
}

export default function CloudDocsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("recent");
  const [documents, setDocuments] = useState<DocumentListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(undefined);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [navigatingDocId, setNavigatingDocId] = useState<number | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "recent") {
      fetchDocuments();
    } else if (activeTab === "shared") {
      fetchSharedDocuments();
    }
  }, [activeTab]);

  const fetchSharedDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/documents/shared", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch shared documents");
      const data: SharedDocItem[] = await res.json();
      setDocuments({ total: data.length, page: 1, pageSize: 50, items: data });
    } catch (err) {
      console.error(err);
      setError("Failed to load shared documents, please try again later");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = currentFolderId
        ? `http://localhost:3001/documents/list?page=1&pageSize=50&folderId=${currentFolderId}`
        : "http://localhost:3001/documents/list?page=1&pageSize=50";
      const res = await fetch(url, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data: DocumentListResponse = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load documents, please try again later");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "recent") {
      fetchDocuments();
    }
  }, [currentFolderId]);

  const handleNewDoc = () => {
    setTemplateModalOpen(true);
  };

  const handleTemplateSelect = async (template: { id: number; name: string } | null) => {
    setTemplateModalOpen(false);
    setCreatingDoc(true);
    try {
      let res: Response;
      if (template) {
        // Create document from template
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/templates/${template.id}/create-document`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title: template.name }),
          },
        );
      } else {
        // Create blank document
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/documents/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title: "Untitled Document" }),
          },
        );
      }
      if (!res.ok) throw new Error("Failed to create document");
      const doc = await res.json();
      router.push(`/home/cloud-docs/${doc.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create document, please try again later");
      setCreatingDoc(false);
    }
  };

  const handleDocClick = useCallback((id: number) => {
    setNavigatingDocId(id);
    router.push(`/home/cloud-docs/${id}`);
  }, [router]);

  /** Delete document */
  const handleDeleteDoc = useCallback(async (id: number) => {
    if (deletingDocId) return;
    setDeletingDocId(id);
    try {
      const res = await fetch("http://localhost:3001/documents/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete document");
      // 从本地列表中移除
      setDocuments((prev) =>
        prev ? { ...prev, total: prev.total - 1, items: prev.items.filter((d) => d.id !== id) } : prev,
      );
    } catch (err) {
      console.error(err);
      setError("Failed to delete document, please try again later");
    } finally {
      setDeletingDocId(null);
    }
  }, [deletingDocId]);

  const handleFolderClick = (folderId: number | undefined) => {
    setCurrentFolderId(folderId);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex flex-1 w-full">
      {/* Folder tree sidebar */}
      <div className="flex-shrink-0">
        <FolderTree onDocClick={handleDocClick} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="container pl-[4%] py-6 max-w-7xl">
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={handleNewDoc}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <VscNewFile className="h-5 w-5" />
              <span>New</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <IoCloudUploadOutline className="h-5 w-5" />
              <span>上传</span>
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              onClick={() => setTemplateModalOpen(true)}
              type="button"
            >
              <CgTemplate className="h-5 w-5" />
              <span>模板库</span>
            </button>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => { setActiveTab("recent"); setCurrentFolderId(undefined); }}
                className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
                  activeTab === "recent"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>My Documents</span>
              </button>
              <button
                onClick={() => setActiveTab("shared")}
                className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
                  activeTab === "shared"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>Shared with me</span>
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
                  activeTab === "favorites"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>Favorites</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : documents && documents.items.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {documents.items.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleDocClick(doc.id)}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between cursor-pointer ${navigatingDocId === doc.id ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      {navigatingDocId === doc.id ? (
                        <svg className="h-5 w-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <FaRegFileAlt className="h-5 w-5 text-gray-600 mt-0.5" />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Created {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeTab === "shared" && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            (doc as any).permission === "editor"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {(doc as any).permission === "editor" ? "可编辑" : "只读"}
                        </span>
                      )}
                      <span className="text-sm text-gray-400">{formatDate(doc.updatedAt)}</span>
                      {activeTab !== "shared" && (
                        <button
                          type="button"
                          title="Delete document"
                          disabled={deletingDocId === doc.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteDoc(doc.id);
                          }}
                          className="ml-1 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                        >
                          {deletingDocId === doc.id ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <FaRegTrashAlt className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No documents yet, click "New" to create one
            </div>
          )}

          {/** Document creation loading overlay */}
          {creatingDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <svg className="h-8 w-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-500">Creating document...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <TemplateSelectorModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
