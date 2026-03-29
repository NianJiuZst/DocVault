"use client";
import { useState } from "react";
import { MdEditNote, MdAdd, MdSearch } from "react-icons/md";

const SAMPLE_NOTES = [
  { id: 1, title: "Meeting Notes - Sprint Planning", updatedAt: "30 minutes ago" },
  { id: 2, title: "Quick Thoughts on Auth Flow", updatedAt: "2 hours ago" },
  { id: 3, title: "Book Summary: Atomic Habits", updatedAt: "Yesterday" },
  { id: 4, title: "Code Review Checklist", updatedAt: "3 days ago" },
];

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#faf8ff" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
            >
              Personal Notes
            </h1>
            <p className="text-sm mt-1" style={{ color: "#444653", opacity: 0.7 }}>
              Your private thinking space
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
            <span>New Note</span>
          </button>
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
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: "#131b2e" }}
          />
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-2 gap-4">
          {SAMPLE_NOTES.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(195, 198, 215, 0.2)",
              }}
            >
              <div className="flex items-start gap-3">
                <MdEditNote size={20} style={{ color: "#0043b5", marginTop: "2px" }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#131b2e" }}>
                    {note.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#444653", opacity: 0.6 }}>
                    {note.updatedAt}
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
