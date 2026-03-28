"use client";

import { FiShare2, FiUpload } from "react-icons/fi";
import ExportDropdown from "./ExportDropdown";
import type { ExportFormat } from "./types";

interface EditorActionBarProps {
	canManageSharing: boolean;
	collabLabel: string;
	disabled: boolean;
	exportingFormat: ExportFormat | null;
	isImporting: boolean;
	saveStatus: "saved" | "saving" | "error";
	onExport: (format: ExportFormat) => Promise<void>;
	onOpenImport: () => void;
	onOpenShare: () => void;
}

function getSaveStatusClassName(saveStatus: "saved" | "saving" | "error") {
	if (saveStatus === "error") {
		return "border-red-100 bg-red-50 text-red-600";
	}
	if (saveStatus === "saving") {
		return "border-amber-100 bg-amber-50 text-amber-600";
	}
	return "border-emerald-100 bg-emerald-50 text-emerald-600";
}

function getSaveStatusLabel(saveStatus: "saved" | "saving" | "error") {
	if (saveStatus === "error") {
		return "保存失败";
	}
	if (saveStatus === "saving") {
		return "保存中...";
	}
	return "已保存";
}

const actionButtonClassName =
	"inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

export default function EditorActionBar({
	canManageSharing,
	collabLabel,
	disabled,
	exportingFormat,
	isImporting,
	saveStatus,
	onExport,
	onOpenImport,
	onOpenShare,
}: EditorActionBarProps) {
	return (
		<div className="flex flex-wrap items-center justify-end gap-3">
			<button
				className={actionButtonClassName}
				disabled={disabled || isImporting}
				onClick={onOpenImport}
				type="button"
			>
				<FiUpload className="h-4 w-4" />
				<span>{isImporting ? "导入中..." : "导入"}</span>
			</button>

			<ExportDropdown
				disabled={disabled}
				exportingFormat={exportingFormat}
				onExport={onExport}
			/>

			{canManageSharing && (
				<button
					className={actionButtonClassName}
					disabled={disabled}
					onClick={onOpenShare}
					type="button"
				>
					<FiShare2 className="h-4 w-4" />
					<span>分享</span>
				</button>
			)}

			{collabLabel && (
				<span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-600">
					{collabLabel}
				</span>
			)}

			<span
				className={`rounded-full border px-3 py-2 text-sm ${getSaveStatusClassName(
					saveStatus,
				)}`}
			>
				{getSaveStatusLabel(saveStatus)}
			</span>
		</div>
	);
}
