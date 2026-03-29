"use client";
import { useState } from "react";
import { MdWorkspacePremium, MdAutoAwesome, MdDescription, MdFolder, MdCheckCircle } from "react-icons/md";

const STATS = [
  { icon: <MdDescription size={20} />, label: "Total Documents", value: "128" },
  { icon: <MdFolder size={20} />, label: "Folders", value: "12" },
  { icon: <MdAutoAwesome size={20} />, label: "AI-indexed", value: "1,284" },
];

const FEATURES = [
  "Smart document organization with AI-powered categorization",
  "Real-time collaboration with your team members",
  "Full-text search across all your documents",
  "RAG-powered knowledge base for instant answers",
  "End-to-end encrypted cloud storage",
];

export default function CloudDocsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#faf8ff" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0043b5, #145ae2)" }}
            >
              <MdWorkspacePremium size={28} color="#ffffff" />
            </div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
              >
                Programming & AI Workspace
              </h1>
              <p className="text-sm mt-1" style={{ color: "#444653", opacity: 0.7 }}>
                Your intelligent knowledge hub
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-2xl"
              style={{
                background: "#f2f3ff",
                border: "1px solid rgba(195, 198, 215, 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-3" style={{ color: "#0043b5" }}>
                {stat.icon}
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#444653", opacity: 0.6 }}>
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mb-10">
          <h2
            className="text-xl font-bold mb-3"
            style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
          >
            About this Workspace
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#444653" }}>
            This workspace is dedicated to programming resources and AI knowledge management.
            Organize your code notes, research papers, and AI documentation in one place.
            Use the sidebar to navigate folders, or search for specific content instantly.
          </p>
        </div>

        {/* Features */}
        <div className="mb-10">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
          >
            Features
          </h2>
          <div className="space-y-3">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <MdCheckCircle size={18} className="mt-0.5 flex-shrink-0" style={{ color: "#0043b5" }} />
                <span className="text-sm" style={{ color: "#444653" }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "#f2f3ff",
            border: "1px solid rgba(195, 198, 215, 0.2)",
          }}
        >
          <h3
            className="font-bold mb-2"
            style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
          >
            Quick Start
          </h3>
          <p className="text-sm" style={{ color: "#444653" }}>
            Use the <strong>New</strong> button in the sidebar to create your first document,
            or expand the <strong>Workspace</strong> folder to browse existing files.
            Click any document to start editing.
          </p>
        </div>
      </div>
    </div>
  );
}
