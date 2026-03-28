"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiDownload } from "react-icons/fi";
import type { ExportFormat } from "./types";

interface ExportDropdownProps {
	disabled?: boolean;
	exportingFormat: ExportFormat | null;
	onExport: (format: ExportFormat) => Promise<void>;
}

export default function ExportDropdown({
	disabled = false,
	exportingFormat,
	onExport,
}: ExportDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		return () => document.removeEventListener("mousedown", handlePointerDown);
	}, [isOpen]);

	const handleSelect = async (format: ExportFormat) => {
		setIsOpen(false);
		await onExport(format);
	};

	const buttonLabel =
		exportingFormat === "markdown"
			? "导出 Markdown..."
			: exportingFormat === "pdf"
				? "导出 PDF..."
				: "导出";

	return (
		<div className="relative" ref={containerRef}>
			<button
				aria-expanded={isOpen}
				aria-haspopup="menu"
				className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={disabled || exportingFormat !== null}
				onClick={() => setIsOpen((open) => !open)}
				type="button"
			>
				<FiDownload className="h-4 w-4" />
				<span>{buttonLabel}</span>
				<FiChevronDown
					className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<div className="absolute right-0 z-20 mt-2 min-w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
					<button
						className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
						onClick={() => void handleSelect("markdown")}
						type="button"
					>
						导出为 Markdown
					</button>
					<button
						className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
						onClick={() => void handleSelect("pdf")}
						type="button"
					>
						导出为 PDF
					</button>
				</div>
			)}
		</div>
	);
}
