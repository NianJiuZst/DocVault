"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdStar, MdSearch } from "react-icons/md";

const FAVORITES = [
  { id: 1, title: "TypeScript Best Practices Guide", updatedAt: "2 hours ago" },
  { id: 2, title: "RAG Architecture Deep Dive", updatedAt: "1 day ago" },
  { id: 3, title: "Next.js Performance Optimization", updatedAt: "3 days ago" },
  { id: 4, title: "LLM Prompt Engineering Handbook", updatedAt: "1 week ago" },
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#faf8ff" }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
          >
            Favorites
          </h1>
          <p className="text-sm mt-1" style={{ color: "#444653", opacity: 0.7 }}>
            Your bookmarked documents
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
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: "#131b2e" }}
          />
        </div>

        {/* Favorites List */}
        <div className="space-y-3">
          {FAVORITES.map((doc) => (
            <div
              key={doc.id}
              onClick={() => router.push(`/home/cloud-docs/${doc.id}`)}
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
                  <MdStar size={20} style={{ color: "#0043b5" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#131b2e" }}>
                    {doc.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#444653", opacity: 0.6 }}>
                    Updated {doc.updatedAt}
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
