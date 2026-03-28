"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/documents/search?q=${encodeURIComponent(value)}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      }
    } catch {
      setResults([]);
    }
  };

  const handleSelect = (id: number) => {
    setShowDropdown(false);
    setQuery("");
    router.push(`/home/cloud-docs/${id}`);
  };

  return (
    <div className="relative w-96">
      <input
        type="text"
        value={query}
        placeholder="🔍 搜索文档..."
        className="w-full py-3 pl-12 pr-5 rounded-xl font-medium text-gray-800 placeholder-gray-500 transition-all duration-300 focus:ring-0"
        style={{
          backgroundColor: "rgb(255, 255, 255)",
          color: "rgb(96, 92, 88)",
          border: "1px solid rgb(160, 147, 252)",
          boxShadow: "0 1px 4px rgba(160, 147, 252, 0.2)",
        }}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(160, 147, 252, 0.3)";
          e.currentTarget.style.transform = "scale(1.01)";
          if (results.length > 0) setShowDropdown(true);
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(160, 147, 252, 0.2)";
          e.currentTarget.style.transform = "scale(1)";
          // Delay hide to allow click on result
          setTimeout(() => setShowDropdown(false), 200);
        }}
      />
      {showDropdown && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
        >
          {results.map((r) => (
            <div
              key={r.id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
              onClick={() => handleSelect(r.id)}
            >
              <span className="text-gray-600">📄</span>
              <span className="font-medium text-gray-800">{r.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
