"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import StarterKit from "@tiptap/starter-kit";
import { SuggestionMenu } from "@/extension/suggestion-menu/SuggestionMenu";
import { YoutubeExtension } from "@/extension/YouTube/YouTube";
import { useAuth } from "@/app/components/AuthProvider";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import EditorActionBar from "./components/EditorActionBar";
import FormattingToolbar from "./components/FormattingToolbar";
import ImportMarkdownModal from "./components/ImportMarkdownModal";
import ShareDrawer from "./components/ShareDrawer";
import type {
	ActionMessage,
	DocumentDetails,
	DocumentShare,
	ExportFormat,
	ShareRole,
} from "./components/types";

const AUTOSAVE_DELAY = 2000;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const FALLBACK_STATUSES = new Set([404, 405, 415]);

function buildExtensions(yDoc: Y.Doc) {
	return [
		StarterKit.configure({
			paragraph: {
				HTMLAttributes: {
					style:
						"line-height: 1.65; margin-bottom: 1.5em; margin-top: 0.5em; font-size: 16px; color: #333333;",
				},
			},
			bulletList: {
				HTMLAttributes: {
					style: "margin-left: 1.5em; margin-bottom: 1.5em; margin-top: 0.5em;",
				},
			},
			orderedList: {
				HTMLAttributes: {
					style: "margin-left: 1.5em; margin-bottom: 1.5em; margin-top: 0.5em;",
				},
			},
			listItem: {
				HTMLAttributes: {
					style: "margin-bottom: 0.75em;",
				},
			},
			blockquote: {
				HTMLAttributes: {
					style:
						"border-left: 4px solid #e0e0e0; padding: 12px 20px; margin: 1.5em 0; color: #555555; font-style: italic; background-color: #f8f8f8; border-radius: 0 4px 4px 0;",
				},
			},
			codeBlock: {
				HTMLAttributes: {
					style:
						'background-color: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 1.5em 0; font-family: "Consolas", "Monaco", "Courier New", monospace;',
				},
			},
			code: {
				HTMLAttributes: {
					style:
						'background-color: #f5f5f5; padding: 2px 4px; border-radius: 4px; font-family: "Consolas", "Monaco", "Courier New", monospace; font-size: 0.95em;',
				},
			},
			heading: {
				HTMLAttributes: {
					style:
						"margin-top: 1.8em; margin-bottom: 0.8em; font-weight: bold; color: #222222;",
				},
			},
		}),
		TextStyleKit,
		SuggestionMenu,
		TaskItem,
		TaskList,
		YoutubeExtension,
		Collaboration.configure({ document: yDoc }),
	];
}

async function getErrorMessage(response: Response, fallbackMessage: string) {
	const rawText = await response.text();
	if (!rawText) {
		return fallbackMessage;
	}

	try {
		const parsed = JSON.parse(rawText) as {
			message?: string | string[];
			error?: string;
		};
		if (Array.isArray(parsed.message)) {
			return parsed.message.join("，");
		}
		if (typeof parsed.message === "string") {
			return parsed.message;
		}
		if (typeof parsed.error === "string") {
			return parsed.error;
		}
	} catch {
		return rawText;
	}

	return fallbackMessage;
}

async function requestWithFallback(
	requestBuilders: Array<() => Promise<Response>>,
) {
	let lastResponse: Response | null = null;

	for (const buildRequest of requestBuilders) {
		const response = await buildRequest();
		lastResponse = response;
		if (!FALLBACK_STATUSES.has(response.status)) {
			return response;
		}
	}

	if (!lastResponse) {
		throw new Error("Request failed");
	}

	return lastResponse;
}

function sanitizeFilename(name: string) {
	const trimmed = name.trim();
	return trimmed.replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]+/g, "_") || "document";
}

function downloadBlob(blob: Blob, filename: string) {
	const url = window.URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	window.URL.revokeObjectURL(url);
}

function getFilenameFromDisposition(
	contentDisposition: string | null,
	fallback: string,
) {
	if (!contentDisposition) {
		return fallback;
	}

	const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
	if (utf8Match?.[1]) {
		return decodeURIComponent(utf8Match[1]);
	}

	const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
	if (filenameMatch?.[1]) {
		return filenameMatch[1];
	}

	return fallback;
}

export default function DocEditor() {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuth();
	const docId = params.id as string;
	const [docData, setDocData] = useState<DocumentDetails | null>(null);
	const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
		"saved",
	);
	const [collaborators, setCollaborators] = useState<number>(0);
	const [actionMessage, setActionMessage] = useState<ActionMessage | null>(
		null,
	);
	const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
		null,
	);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
	const [shareLoading, setShareLoading] = useState(false);
	const [shareSubmitting, setShareSubmitting] = useState(false);
	const [shareError, setShareError] = useState<string | null>(null);
	const [publicSubmitting, setPublicSubmitting] = useState(false);
	const [shares, setShares] = useState<DocumentShare[]>([]);
	const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
	const yDocRef = useRef<Y.Doc>(new Y.Doc());
	const providerRef = useRef<HocuspocusProvider | null>(null);
	const canManageSharing = Boolean(
		user && docData && docData.userId === user.id,
	);

	const publicShareUrl = useMemo(() => {
		if (!docData?.shareToken || typeof window === "undefined") {
			return null;
		}

		return `${window.location.origin}/shared/${docData.shareToken}`;
	}, [docData?.shareToken]);

	const showActionMessage = useCallback(
		(tone: ActionMessage["tone"], text: string) => {
			setActionMessage({ tone, text });
		},
		[],
	);

	const saveDocument = useCallback(
		async (content: any) => {
			if (!docId) return;
			setSaveStatus("saving");
			try {
				const res = await fetch(`${API_BASE_URL}/documents/update`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ id: Number(docId), content }),
				});
				if (!res.ok) throw new Error("Save failed");
				setSaveStatus("saved");
			} catch (err) {
				console.error("Auto-save failed:", err);
				setSaveStatus("error");
			}
		},
		[docId],
	);

	const fetchDocument = useCallback(async () => {
		const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error(await getErrorMessage(response, "加载文档失败"));
		}

		const data = (await response.json()) as DocumentDetails;
		setDocData({
			id: data.id,
			title: data.title,
			content: data.content,
			userId: data.userId,
			parentId: data.parentId ?? null,
			isPublic: data.isPublic ?? false,
			shareToken: data.shareToken ?? null,
		});
	}, [docId]);

	const fetchShares = useCallback(async () => {
		if (!canManageSharing) return;

		setShareLoading(true);
		setShareError(null);

		try {
			const response = await requestWithFallback([
				() =>
					fetch(`${API_BASE_URL}/documents/${docId}/shared`, {
						credentials: "include",
					}),
				() =>
					fetch(`${API_BASE_URL}/documents/${docId}/shares`, {
						credentials: "include",
					}),
			]);

			if (!response.ok) {
				throw new Error(await getErrorMessage(response, "加载共享成员失败"));
			}

			const data = (await response.json()) as DocumentShare[];
			setShares(data);
		} catch (error) {
			console.error(error);
			setShareError(
				error instanceof Error ? error.message : "加载共享成员失败",
			);
		} finally {
			setShareLoading(false);
		}
	}, [canManageSharing, docId]);

	useEffect(() => {
		if (!docId) return;

		// Connect WebSocket collaboration
		fetch(`${API_BASE_URL}/auth/token`, { credentials: "include" })
			.then((r) => r.json())
			.then(({ token }) => {
				if (providerRef.current) providerRef.current.destroy();

				const provider = new HocuspocusProvider({
					url: WS_URL,
					name: `doc-${docId}`,
					document: yDocRef.current,
					token: token ?? "",
					onConnect: () => console.log("Collab connected"),
					onDisconnect: () => console.log("Collab disconnected"),
					onAwarenessChange: ({ states }) => {
						setCollaborators(states.length);
					},
				});
				providerRef.current = provider;
			})
			.catch(console.error);

		// Load document data
		void fetchDocument().catch((error) => {
			console.error(error);
			showActionMessage(
				"error",
				error instanceof Error ? error.message : "加载文档失败",
			);
		});

		return () => {
			if (saveTimerRef.current) {
				clearTimeout(saveTimerRef.current);
			}
			providerRef.current?.destroy();
		};
	}, [docId, fetchDocument, showActionMessage]);

	const editor = useEditor({
		extensions: buildExtensions(yDocRef.current),
		immediatelyRender: false,
		injectCSS: false,
		content: "",
		autofocus: true,
		shouldRerenderOnTransaction: false,
		onUpdate: ({ editor }) => {
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
			saveTimerRef.current = setTimeout(() => {
				saveDocument(editor.getJSON());
			}, AUTOSAVE_DELAY);
		},
	});

	// Load content once document data arrives
	useEffect(() => {
		if (docData?.content && editor) {
			editor.commands.setContent(docData.content);
		}
	}, [docData?.content, editor]);

	useEffect(() => {
		if (!actionMessage) return;

		const timer = window.setTimeout(() => setActionMessage(null), 3500);
		return () => window.clearTimeout(timer);
	}, [actionMessage]);

	useEffect(() => {
		if (shareDrawerOpen && canManageSharing) {
			void fetchShares();
		}
	}, [shareDrawerOpen, canManageSharing, fetchShares]);

	const handleShare = useCallback(
		async ({ userId, role }: { userId: number; role: ShareRole }) => {
			setShareSubmitting(true);
			setShareError(null);

			try {
				const response = await fetch(
					`${API_BASE_URL}/documents/${docId}/share`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({
							userId,
							role,
							permission: role,
						}),
					},
				);

				if (!response.ok) {
					throw new Error(await getErrorMessage(response, "分享文档失败"));
				}

				await fetchShares();
				showActionMessage("success", "共享成员已更新");
			} catch (error) {
				console.error(error);
				const message = error instanceof Error ? error.message : "分享文档失败";
				setShareError(message);
				showActionMessage("error", message);
			} finally {
				setShareSubmitting(false);
			}
		},
		[docId, fetchShares, showActionMessage],
	);

	const handleRevokeShare = useCallback(
		async (targetUserId: number) => {
			setShareSubmitting(true);
			setShareError(null);

			try {
				const response = await fetch(
					`${API_BASE_URL}/documents/${docId}/share/${targetUserId}`,
					{
						method: "DELETE",
						credentials: "include",
					},
				);

				if (!response.ok) {
					throw new Error(await getErrorMessage(response, "移除共享成员失败"));
				}

				await fetchShares();
				showActionMessage("success", "共享成员已移除");
			} catch (error) {
				console.error(error);
				const message =
					error instanceof Error ? error.message : "移除共享成员失败";
				setShareError(message);
				showActionMessage("error", message);
			} finally {
				setShareSubmitting(false);
			}
		},
		[docId, fetchShares, showActionMessage],
	);

	const handleEnablePublic = useCallback(async () => {
		setPublicSubmitting(true);
		setShareError(null);

		try {
			const response = await requestWithFallback([
				() =>
					fetch(`${API_BASE_URL}/documents/${docId}/public`, {
						method: "POST",
						credentials: "include",
					}),
				() =>
					fetch(`${API_BASE_URL}/documents/${docId}/share-link`, {
						method: "POST",
						credentials: "include",
					}),
			]);

			if (!response.ok) {
				throw new Error(await getErrorMessage(response, "生成公开链接失败"));
			}

			const data = (await response.json()) as { shareToken?: string | null };
			setDocData((current) =>
				current
					? {
							...current,
							isPublic: true,
							shareToken: data.shareToken ?? current.shareToken,
						}
					: current,
			);
			showActionMessage("success", "公开链接已生成");
		} catch (error) {
			console.error(error);
			const message =
				error instanceof Error ? error.message : "生成公开链接失败";
			setShareError(message);
			showActionMessage("error", message);
		} finally {
			setPublicSubmitting(false);
		}
	}, [docId, showActionMessage]);

	const handleDisablePublic = useCallback(async () => {
		setPublicSubmitting(true);
		setShareError(null);

		try {
			const response = await fetch(
				`${API_BASE_URL}/documents/${docId}/public`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			if (!response.ok) {
				throw new Error(await getErrorMessage(response, "关闭公开访问失败"));
			}

			setDocData((current) =>
				current
					? {
							...current,
							isPublic: false,
							shareToken: null,
						}
					: current,
			);
			showActionMessage("success", "公开访问已关闭");
		} catch (error) {
			console.error(error);
			const message =
				error instanceof Error ? error.message : "关闭公开访问失败";
			setShareError(message);
			showActionMessage("error", message);
		} finally {
			setPublicSubmitting(false);
		}
	}, [docId, showActionMessage]);

	const handleCopyPublicUrl = useCallback(async () => {
		if (!publicShareUrl) return;

		try {
			await navigator.clipboard.writeText(publicShareUrl);
			showActionMessage("success", "公开链接已复制");
		} catch (error) {
			console.error(error);
			showActionMessage("error", "复制公开链接失败");
		}
	}, [publicShareUrl, showActionMessage]);

	const handleExport = useCallback(
		async (format: ExportFormat) => {
			setExportingFormat(format);

			try {
				if (format === "markdown") {
					const response = await fetch(
						`${API_BASE_URL}/documents/${docId}/export/markdown`,
						{
							credentials: "include",
						},
					);

					if (!response.ok) {
						throw new Error(
							await getErrorMessage(response, "导出 Markdown 失败"),
						);
					}

					const data = (await response.json()) as {
						title: string;
						content: string;
					};
					const filename = `${sanitizeFilename(data.title || docData?.title || `document-${docId}`)}.md`;
					downloadBlob(
						new Blob([data.content], { type: "text/markdown;charset=utf-8" }),
						filename,
					);
				} else {
					const response = await fetch(
						`${API_BASE_URL}/documents/${docId}/export/pdf`,
						{
							credentials: "include",
						},
					);

					if (!response.ok) {
						throw new Error(await getErrorMessage(response, "导出 PDF 失败"));
					}

					const filename = getFilenameFromDisposition(
						response.headers.get("content-disposition"),
						`${sanitizeFilename(docData?.title || `document-${docId}`)}.pdf`,
					);
					const blob = await response.blob();
					downloadBlob(blob, filename);
				}

				showActionMessage(
					"success",
					`已开始导出${format === "pdf" ? " PDF" : " Markdown"}`,
				);
			} catch (error) {
				console.error(error);
				showActionMessage(
					"error",
					error instanceof Error ? error.message : "导出失败",
				);
			} finally {
				setExportingFormat(null);
			}
		},
		[docId, docData?.title, showActionMessage],
	);

	const handleImportMarkdown = useCallback(
		async ({ title, file }: { title: string; file: File }) => {
			setIsImporting(true);

			try {
				const markdownContent = await file.text();
				const fallbackParentId =
					docData &&
					user &&
					docData.userId === user.id &&
					docData.parentId !== null
						? docData.parentId
						: undefined;

				const formData = new FormData();
				formData.append("file", file);
				formData.append("title", title);
				formData.append("content", markdownContent);
				if (fallbackParentId !== undefined) {
					formData.append("parentId", String(fallbackParentId));
				}

				let response = await fetch(
					`${API_BASE_URL}/documents/${docId}/import/markdown`,
					{
						method: "POST",
						credentials: "include",
						body: formData,
					},
				);

				if (FALLBACK_STATUSES.has(response.status)) {
					response = await fetch(`${API_BASE_URL}/documents/import/markdown`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({
							title,
							content: markdownContent,
							parentId: fallbackParentId,
						}),
					});
				}

				if (!response.ok) {
					throw new Error(
						await getErrorMessage(response, "导入 Markdown 失败"),
					);
				}

				const data = (await response.json()) as { id: number };
				setImportModalOpen(false);
				showActionMessage("success", "Markdown 已导入为新文档");
				router.push(`/home/cloud-docs/${data.id}`);
			} catch (error) {
				console.error(error);
				showActionMessage(
					"error",
					error instanceof Error ? error.message : "导入 Markdown 失败",
				);
			} finally {
				setIsImporting(false);
			}
		},
		[docData, docId, router, showActionMessage, user],
	);

	const collabLabel = collaborators > 1 ? `${collaborators} 人正在编辑` : "";
	const actionMessageClassName =
		actionMessage?.tone === "error"
			? "border-red-100 bg-red-50 text-red-600"
			: actionMessage?.tone === "info"
				? "border-blue-100 bg-blue-50 text-blue-600"
				: "border-emerald-100 bg-emerald-50 text-emerald-600";

	return (
		<div className="flex h-[calc(100vh-2rem)] w-full flex-col bg-slate-50 p-4">
			<div className="mb-4 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
				<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
					<div className="min-w-0 flex-1">
						{editor ? (
							<FormattingToolbar editor={editor} />
						) : (
							<p className="text-sm text-slate-500">编辑器初始化中...</p>
						)}
					</div>
					<EditorActionBar
						canManageSharing={canManageSharing}
						collabLabel={collabLabel}
						disabled={!docData}
						exportingFormat={exportingFormat}
						isImporting={isImporting}
						onExport={handleExport}
						onOpenImport={() => setImportModalOpen(true)}
						onOpenShare={() => setShareDrawerOpen(true)}
						saveStatus={saveStatus}
					/>
				</div>

				{actionMessage && (
					<div
						className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${actionMessageClassName}`}
					>
						{actionMessage.text}
					</div>
				)}
			</div>

			<div className="min-h-0 flex-1 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
				<div className="border-b border-slate-100 px-8 py-6">
					<p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
						Cloud Doc
					</p>
					<h1 className="mt-2 text-2xl font-semibold text-slate-900">
						{docData?.title || "正在加载文档..."}
					</h1>
				</div>

				<div className="relative h-[calc(100%-98px)]">
					<div className="h-full w-full overflow-y-auto outline-none">
						<EditorContent
							editor={editor}
							className="prose-container h-full px-14 py-8 outline-none border-none"
						/>
					</div>
				</div>
			</div>

			<ImportMarkdownModal
				isOpen={importModalOpen}
				isSubmitting={isImporting}
				onClose={() => setImportModalOpen(false)}
				onImport={handleImportMarkdown}
			/>

			<ShareDrawer
				documentTitle={docData?.title || "未命名文档"}
				error={shareError}
				isOpen={shareDrawerOpen}
				isPublic={docData?.isPublic ?? false}
				onClose={() => setShareDrawerOpen(false)}
				onCopyPublicUrl={handleCopyPublicUrl}
				onDisablePublic={handleDisablePublic}
				onEnablePublic={handleEnablePublic}
				onPermissionChange={(targetUserId, role) =>
					handleShare({ userId: targetUserId, role })
				}
				onRevoke={handleRevokeShare}
				onShare={handleShare}
				publicSubmitting={publicSubmitting}
				publicUrl={publicShareUrl}
				shareLoading={shareLoading}
				shareSubmitting={shareSubmitting}
				shares={shares}
			/>
		</div>
	);
}
