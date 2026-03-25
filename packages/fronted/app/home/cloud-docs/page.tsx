"use client";
import { VscNewFile } from "react-icons/vsc";
import { IoCloudUploadOutline } from "react-icons/io5";
import { CgTemplate } from "react-icons/cg";
import { useState, useEffect } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

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

export default function CloudDocsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("recent");
  const [documents, setDocuments] = useState<DocumentListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "recent") {
      fetchDocuments();
    }
  }, [activeTab]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3001/documents/list?page=1&pageSize=50", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data: DocumentListResponse = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError("加载文档失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleNewDoc = async () => {
    try {
      const res = await fetch("http://localhost:3001/documents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "未命名文档" }),
      });
      if (!res.ok) throw new Error("Failed to create document");
      const doc = await res.json();
      router.push(`/home/cloud-docs/${doc.id}`);
    } catch (err) {
      console.error(err);
      setError("创建文档失败，请稍后重试");
    }
  };

  const handleDocClick = (id: number) => {
    router.push(`/home/cloud-docs/${id}`);
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
    <div className="min-h-screen bg-white flex justify-start flex-col w-full ">
      <div className="container pl-[4%] py-6 max-w-7xl">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleNewDoc}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <VscNewFile className="h-5 w-5" />
            <span>新建</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <IoCloudUploadOutline className="h-5 w-5" />
            <span>上传</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
            <CgTemplate className="h-5 w-5" />
            <span>模板库</span>
          </button>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
                activeTab === "recent"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>我的文档</span>
            </button>
            <button
              onClick={() => setActiveTab("shared")}
              className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
                activeTab === "shared"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>与我共享</span>
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
                activeTab === "favorites"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>收藏</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : documents && documents.items.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {documents.items.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocClick(doc.id)}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <FaRegFileAlt className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        创建于 {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">{formatDate(doc.updatedAt)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            暂无文档，点击「新建」创建一个吧
          </div>
        )}
      </div>
    </div>
  );
}
