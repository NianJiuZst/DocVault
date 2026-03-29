"use client";
import { useState } from "react";
import { MdGroup, MdSearch } from "react-icons/md";

const SAMPLE_SHARED = [
  { id: 1, title: "Q4 Product Roadmap", owner: "Alice L.", updatedAt: "1 hour ago", access: "Edit" },
  { id: 2, title: "Design System Guidelines", owner: "Bob K.", updatedAt: "3 hours ago", access: "View" },
  { id: 3, title: "API Rate Limiting Spec", owner: "Charlie W.", updatedAt: "Yesterday", access: "Edit" },
];

export default function SharedPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#faf8ff" }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
          >
            Shared with Me
          </h1>
          <p className="text-sm mt-1" style={{ color: "#444653", opacity: 0.7 }}>
            Documents shared by your team members
          </p>
        </div>

        {/* Search */}
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
            placeholder="Search shared documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: "#131b2e" }}
          />
        </div>

        {/* Shared List */}
        <div className="space-y-3">
          {SAMPLE_SHARED.map((doc) => (
            <div
              key={doc.id}
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
                  <MdGroup size={20} style={{ color: "#0043b5" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#131b2e" }}>
                    {doc.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#444653", opacity: 0.6 }}>
                    {doc.owner} · {doc.updatedAt}
                  </p>
                </div>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: doc.access === "Edit" ? "#e8f5e9" : "#f2f3ff",
                  color: doc.access === "Edit" ? "#2e7d32" : "#444653",
                }}
              >
                {doc.access}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
