"use client";
import { MdExtension, MdAdd } from "react-icons/md";

const PLUGINS = [
  { id: 1, name: "GitHub Integration", description: "Link PRs and issues to your documents", installed: true },
  { id: 2, name: "Notion Import", description: "Import pages from Notion workspaces", installed: true },
  { id: 3, name: "Slack Notifications", description: "Get alerts when documents are shared", installed: false },
  { id: 4, name: "Zotero Connector", description: "Sync references from your Zotero library", installed: false },
];

export default function PluginsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#faf8ff" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "Manrope, sans-serif", color: "#131b2e" }}
            >
              Plugins
            </h1>
            <p className="text-sm mt-1" style={{ color: "#444653", opacity: 0.7 }}>
              Extend DocVault with powerful integrations
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md"
            style={{
              background: "#f2f3ff",
              color: "#0043b5",
              border: "1px solid rgba(195, 198, 215, 0.3)",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            <MdAdd size={18} />
            <span>Browse Plugins</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {PLUGINS.map((plugin) => (
            <div
              key={plugin.id}
              className="p-5 rounded-2xl transition-all hover:shadow-sm"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(195, 198, 215, 0.2)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#f2f3ff" }}
                >
                  <MdExtension size={20} style={{ color: "#0043b5" }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "#131b2e" }}>
                    {plugin.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#444653", opacity: 0.7 }}>
                    {plugin.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: plugin.installed ? "#e8f5e9" : "#f2f3ff",
                    color: plugin.installed ? "#2e7d32" : "#444653",
                  }}
                >
                  {plugin.installed ? "Installed" : "Not installed"}
                </span>
                <button
                  className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                  style={{
                    background: plugin.installed ? "transparent" : "#0043b5",
                    color: plugin.installed ? "#0043b5" : "#ffffff",
                    border: plugin.installed ? "1px solid #0043b5" : "none",
                  }}
                >
                  {plugin.installed ? "Configure" : "Install"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
