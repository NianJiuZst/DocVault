"use client";

import { useEffect, useState } from "react";
import { FiFileText, FiUploadCloud, FiX } from "react-icons/fi";

interface ImportMarkdownModalProps {
	isOpen: boolean;
	isSubmitting: boolean;
	onClose: () => void;
	onImport: (payload: { title: string; file: File }) => Promise<void>;
}

function deriveTitleFromFileName(fileName: string) {
	return fileName.replace(/\.md$/i, "").trim() || "导入文档";
}

export default function ImportMarkdownModal({
	isOpen,
	isSubmitting,
	onClose,
	onImport,
}: ImportMarkdownModalProps) {
	const [title, setTitle] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		setTitle("");
		setFile(null);
		setError(null);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !isSubmitting) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, isSubmitting, onClose]);

	if (!isOpen) {
		return null;
	}

	const handleFileChange = (nextFile: File | null) => {
		setFile(nextFile);
		setError(null);
		if (nextFile) {
			setTitle(
				(currentTitle) =>
					currentTitle || deriveTitleFromFileName(nextFile.name),
			);
		}
	};

	const handleSubmit = async () => {
		if (!file) {
			setError("请选择一个 Markdown 文件");
			return;
		}

		if (!/\.md$/i.test(file.name)) {
			setError("当前仅支持导入 .md 文件");
			return;
		}

		const nextTitle = title.trim() || deriveTitleFromFileName(file.name);
		await onImport({ title: nextTitle, file });
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl">
				<div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
					<div>
						<p className="text-lg font-semibold text-slate-900">
							导入 Markdown
						</p>
						<p className="mt-1 text-sm text-slate-500">
							会创建一个新文档，不会覆盖当前编辑内容。
						</p>
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
					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-700">
							文档标题
						</span>
						<input
							className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition-colors focus:border-blue-400"
							onChange={(event) => setTitle(event.target.value)}
							placeholder="默认使用文件名"
							type="text"
							value={title}
						/>
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-700">
							Markdown 文件
						</span>
						<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
							<div className="flex items-center gap-3 text-slate-600">
								<FiUploadCloud className="h-5 w-5" />
								<span className="text-sm">选择本地 `.md` 文件</span>
							</div>
							<input
								accept=".md,text/markdown"
								className="mt-4 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
								onChange={(event) =>
									handleFileChange(event.target.files?.[0] ?? null)
								}
								type="file"
							/>
							{file && (
								<div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
									<FiFileText className="h-4 w-4" />
									<span>{file.name}</span>
								</div>
							)}
						</div>
					</label>

					{error && (
						<div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
							{error}
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
						disabled={isSubmitting}
						onClick={() => void handleSubmit()}
						type="button"
					>
						{isSubmitting ? "导入中..." : "开始导入"}
					</button>
				</div>
			</div>
		</div>
	);
}
