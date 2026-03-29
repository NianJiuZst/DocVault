"use client";
import { type ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import avatarsrc from "@/src/image/deavatar.jpg";
import { ThemeProvider, useTheme } from "@/src/theme/ThemeProvider";
import { FiSun } from "react-icons/fi";
import { BsMoon } from "react-icons/bs";
import {
  MdSpaceDashboard,
  MdDatabase,
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

const NAV_ITEMS = [
  { icon: <MdSpaceDashboard size={20} />, label: "Workspace", href: "/home/cloud-docs" },
  { icon: <MdDatabase size={20} />, label: "Knowledge Base", href: "/home/knowledge-base" },
  { icon: <MdEditNote size={20} />, label: "Personal Notes", href: "/home/notes" },
  { icon: <MdGroup size={20} />, label: "Shared Docs", href: "/home/shared" },
  { icon: <MdExtension size={20} />, label: "Plugins", href: "/home/plugins" },
];

const FAVORITES = [
  { label: "Project Research", icon: <MdStar size={16} className="text-amber-500" /> },
];

export default function HomeLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: "#faf8ff", color: "#191b23" }}>
        {/* ============================================
            Left Sidebar (256px fixed)
            ============================================ */}
        <aside
          className="w-64 flex-shrink-0 flex flex-col h-full border-r"
          style={{
            background: "#f2f3ff",
            borderColor: "rgba(195, 198, 215, 0.3)",
          }}
        >
          {/* Logo + New Page */}
          <div className="p-6 space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0043b5, #145ae2)" }}
              >
                <MdAutoAwesome size={20} />
              </div>
              <div>
                <h1 className="font-bold leading-tight" style={{ fontFamily: "Manrope, sans-serif", fontSize: "1rem", color: "#131b2e" }}>
                  DocVault
                </h1>
                <p className="text-xs font-medium" style={{ color: "#444653" }}>
                  Premium Plan
                </p>
              </div>
            </div>

            {/* New Page Button */}
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold transition-all hover:shadow-sm"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(195, 198, 215, 0.2)",
                fontFamily: "Manrope, sans-serif",
                fontSize: "0.875rem",
                color: "#0043b5",
              }}
            >
              <MdAdd size={18} />
              <span>New Page</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors"
                  style={
                    isActive
                      ? {
                          background: "rgba(255,255,255,0.5)",
                          color: "#3E5CCB",
                          fontWeight: 700,
                          borderLeft: "4px solid #0043b5",
                          paddingLeft: "12px",
                        }
                      : {
                          color: "#131b2e",
                          opacity: 0.8,
                        }
                  }
                >
                  <span className={isActive ? "text-[#3E5CCB]" : ""}>{item.icon}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem", fontWeight: isActive ? 700 : 500 }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Favorites */}
            <div className="pt-6 pb-2 px-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#444653", opacity: 0.5 }}>
                Favorites
              </p>
            </div>
            {FAVORITES.map((fav) => (
              <div
                key={fav.label}
                className="flex items-center gap-3 px-4 py-2 opacity-80 hover:opacity-100 cursor-pointer transition-opacity rounded-lg"
              >
                {fav.icon}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem" }}>{fav.label}</span>
              </div>
            ))}
          </nav>

          {/* Footer Links */}
          <div className="p-4 mt-auto space-y-1">
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
            className="flex items-center justify-between px-16 flex-shrink-0"
            style={{
              height: "4rem",
              background: "#faf8ff",
              borderBottom: "1px solid rgba(195, 198, 215, 0.3)",
            }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: "#444653", opacity: 0.6 }}>Workspace</span>
              <MdChevronRight size={14} style={{ opacity: 0.3 }} />
              <span className="text-sm font-medium">Project Research & RAG Implementation</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* User Avatars */}
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                  <Image src={avatarsrc} alt="User" fill style={{ objectFit: "cover" }} />
                </div>
                <div
                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative flex items-center justify-center text-xs font-bold"
                  style={{ background: "#c3ccff", color: "#3b446e" }}
                >
                  AL
                </div>
                <div
                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative flex items-center justify-center text-xs font-bold"
                  style={{ background: "#e9ddff", color: "#5516be" }}
                >
                  ZX
                </div>
                <div
                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative flex items-center justify-center text-xs font-bold"
                  style={{ background: "#d0bcff", color: "#23005c" }}
                >
                  +3
                </div>
              </div>

              {/* Share Button */}
              <button
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity"
                style={{ background: "#145ae2", color: "#ffffff" }}
              >
                Share
              </button>

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
                  <h3 className="font-bold" style={{ fontFamily: "Manrope, sans-serif", fontSize: "0.9rem", color: "#131b2e" }}>
                    Curator Assistant
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
                {/* User Message */}
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-none text-sm shadow-sm"
                    style={{ background: "#0043b5", color: "#ffffff" }}
                  >
                    Summarize our research on persistence
                  </div>
                  <span className="text-xs font-medium" style={{ color: "#444653", opacity: 0.6 }}>Just now</span>
                </div>

                {/* AI Response */}
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "#ffdbc8", color: "#321300" }}
                    >
                      <MdPsychology size={14} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#444653" }}>RAG-Powered Answer</span>
                  </div>
                  <div
                    className="p-4 rounded-2xl rounded-tl-none max-w-[95%] shadow-sm"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(195, 198, 215, 0.2)",
                    }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: "#131b2e" }}>
                      Based on your knowledge base, persistence research focuses on two pillars:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm" style={{ color: "#444653" }}>
                      <li className="flex gap-2">
                        <span className="font-bold" style={{ color: "#0043b5" }}>1.</span>
                        <span>Vector Index scaling for multi-format documents.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold" style={{ color: "#0043b5" }}>2.</span>
                        <span>Dynamic chunking strategies (small vs large context blocks).</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(195, 198, 215, 0.2)" }}>
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest mb-2" style={{ color: "#444653" }}>Sources Found</p>
                      <div className="flex flex-wrap gap-2">
                        {["Implementation_v1.md", "Research_Notes"].map((src) => (
                          <span
                            key={src}
                            className="px-2 py-1 rounded text-[0.7rem] font-medium flex items-center gap-1"
                            style={{
                              background: "#f2f3ff",
                              border: "1px solid rgba(195, 198, 215, 0.2)",
                              color: "#444653",
                            }}
                          >
                            <span style={{ fontSize: "0.8rem" }}>📄</span>
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div
                className="p-6"
                style={{ borderTop: "1px solid rgba(195, 198, 215, 0.2)" }}
              >
                <div
                  className="flex items-center rounded-2xl p-2 gap-2"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(195, 198, 215, 0.3)",
                  }}
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
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
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
                    <span className="text-[0.65rem] font-bold uppercase" style={{ color: "#444653", opacity: 0.4 }}>
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
    </ThemeProvider>
  );
}
