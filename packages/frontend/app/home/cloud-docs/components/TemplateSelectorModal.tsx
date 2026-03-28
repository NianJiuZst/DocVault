"use client";

import { useEffect, useState } from "react";
import { FiX, FiFileText, FiTrendingUp, FiUsers, FiCheckSquare } from "react-icons/fi";

interface Template {
  id: number;
  name: string;
  category: string;
  isPublic: boolean;
  ownerId: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  weekly_report: <FiTrendingUp className="h-5 w-5" />,
  meeting_notes: <FiUsers className="h-5 w-5" />,
  retro: <FiCheckSquare className="h-5 w-5" />,
  prd: <FiFileText className="h-5 w-5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  weekly_report: "周报",
  meeting_notes: "会议纪要",
  retro: "复盘",
  prd: "PRD",
};

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export default function TemplateSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: TemplateSelectorModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setSelected(null);
    setLoading(true);

    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/templates`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplates();
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selected) return;
    setCreating(true);
    await onSelect(selected);
    setCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-lg font-semibold text-slate-900">从模板创建</p>
            <p className="mt-1 text-sm text-slate-500">选择一个模板快速开始</p>
          </div>
          <button
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {/* Blank document option */}
          <button
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
              selected === null
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
            onClick={() => setSelected(null)}
            type="button"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FiFileText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-slate-900">空白文档</p>
              <p className="text-sm text-slate-500">从空白页面开始</p>
            </div>
            {selected === null && (
              <div className="ml-auto">
                <div className="h-5 w-5 rounded-full bg-blue-500" />
              </div>
            )}
          </button>

          {/* Template list */}
          {loading ? (
            <div className="py-8 text-center text-slate-500">正在加载模板...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                    selected?.id === t.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelected(t)}
                  type="button"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    {CATEGORY_ICONS[t.category] || <FiFileText className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">
                      {CATEGORY_LABELS[t.category] || t.category}
                    </p>
                  </div>
                  {selected?.id === t.id && (
                    <div className="ml-auto flex-shrink-0">
                      <div className="h-5 w-5 rounded-full bg-blue-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            取消
          </button>
          <button
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={creating}
            onClick={() => void handleConfirm()}
            type="button"
          >
            {creating ? "创建中..." : "创建文档"}
          </button>
        </div>
      </div>
    </div>
  );
}
