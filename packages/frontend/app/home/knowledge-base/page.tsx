"use client";
import { useState } from "react";
import { MdLibraryBooks, MdAdd, MdSearch } from "react-icons/md";

const SAMPLE_ITEMS = [
  { id: 1, title: "Product Requirements 2024", updatedAt: "2 hours ago", count: 12 },
  { id: 2, title: "API Documentation v2", updatedAt: "1 day ago", count: 8 },
  { id: 3, title: "Architecture Overview", updatedAt: "3 days ago", count: 24 },
  { id: 4, title: "User Research Findings", updatedAt: "1 week ago", count: 15 },
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#faf8ff" }}>
      {/* Page Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
            >
              Knowledge Base
            </h1>
            <p className="text-sm mt-1" style={{ color: "#444653", opacity: 0.7 }}>
              Manage your AI-powered knowledge corpus
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md"
            style={{
              background: "#0043b5",
              color: "#ffffff",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            <MdAdd size={18} />
            <span>Import Document</span>
          </button>
        </div>

        {/* Search Bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-8"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(195, 198, 215, 0.3)",
          }}
        >
          <MdSearch size={18} style={{ color: "#444653", opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search your knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: "#131b2e" }}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Documents", value: "1,284" },
            { label: "Indexed Chunks", value: "48,291" },
            { label: "Last Updated", value: "Just now" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl"
              style={{
                background: "#f2f3ff",
                border: "1px solid rgba(195, 198, 215, 0.2)",
              }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#444653", opacity: 0.5 }}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold" style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {SAMPLE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all hover:shadow-sm"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(195, 198, 215, 0.2)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#f2f3ff" }}
                >
                  <MdLibraryBooks size={20} style={{ color: "#0043b5" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#131b2e" }}>
                    {item.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#444653", opacity: 0.6 }}>
                    Updated {item.updatedAt} · {item.count} chunks
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
