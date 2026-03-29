"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import StarterKit from "@tiptap/starter-kit";
import { SuggestionMenu } from "@/extension/suggestion-menu/SuggestionMenu";
import { YoutubeExtension } from "@/extension/YouTube/YouTube";
import { useAuth } from "@/app/components/AuthProvider";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import ImportMarkdownModal from "./components/ImportMarkdownModal";
import ShareDrawer from "./components/ShareDrawer";
import type {
	ActionMessage,
	DocumentDetails,
	DocumentShare,
	ExportFormat,
	ShareRole,
} from "./components/types";
import styles from "./page.module.css";

const AUTOSAVE_DELAY = 2000;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const FALLBACK_STATUSES = new Set([404, 405, 415]);

const NAV_ITEMS = [
	{ icon: "dashboard", label: "Workspace", active: false },
	{ icon: "library_books", label: "Knowledge Base", active: true },
	{ icon: "sticky_note_2", label: "Personal Notes", active: false },
	{ icon: "groups", label: "Shared Docs", active: false },
	{ icon: "extension", label: "Plugins", active: false },
];

const SIDEBAR_FOOTER_ITEMS = [
	{ icon: "settings", label: "Settings" },
	{ icon: "help", label: "Help" },
];

const DEFAULT_TOOLBAR_STATE = {
	isBold: false,
	isItalic: false,
	isStrike: false,
	isCode: false,
	isParagraph: false,
	isHeading1: false,
	isHeading2: false,
	isHeading3: false,
	isBulletList: false,
	isOrderedList: false,
	isCodeBlock: false,
	isBlockquote: false,
	canUndo: false,
	canRedo: false,
};

function cx(...classNames: Array<string | false | null | undefined>) {
	return classNames.filter(Boolean).join(" ");
}

function MaterialIcon({
	name,
	className,
}: {
	name: string;
	className?: string;
}) {
	return (
		<span aria-hidden="true" className={cx(styles.materialIcon, className)}>
			{name}
		</span>
	);
}

function ToolbarButton({
	active = false,
	disabled = false,
	icon,
	label,
	onClick,
}: {
	active?: boolean;
	disabled?: boolean;
	icon: string;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			className={cx(styles.toolbarButton, active && styles.toolbarButtonActive)}
			disabled={disabled}
			onClick={onClick}
			type="button"
		>
			<MaterialIcon className={styles.toolbarButtonIcon} name={icon} />
			<span>{label}</span>
		</button>
	);
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

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);

	if (parts.length === 0) {
		return "ME";
	}

	return parts
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
}

function buildExtensions(yDoc: Y.Doc) {
	return [
		StarterKit.configure({
			paragraph: {
				HTMLAttributes: {
					style:
						"line-height: 1.85; margin-bottom: 1.2em; margin-top: 0.35em; font-size: 16px; color: #25304d;",
				},
			},
			bulletList: {
				HTMLAttributes: {
					style:
						"margin-left: 1.5em; margin-bottom: 1.2em; margin-top: 0.35em; color: #25304d;",
				},
			},
			orderedList: {
				HTMLAttributes: {
					style:
						"margin-left: 1.5em; margin-bottom: 1.2em; margin-top: 0.35em; color: #25304d;",
				},
			},
			listItem: {
				HTMLAttributes: {
					style: "margin-bottom: 0.7em;",
				},
			},
			blockquote: {
				HTMLAttributes: {
					style:
						"border-left: 4px solid #0043b5; padding: 16px 20px; margin: 1.6em 0; color: #525c88; background-color: #f2f3ff; border-radius: 0 16px 16px 0;",
				},
			},
			codeBlock: {
				HTMLAttributes: {
					style:
						'background-color: #eef2ff; padding: 18px; border-radius: 16px; overflow-x: auto; margin: 1.5em 0; font-family: "SFMono-Regular", "SFMono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace; color: #131b2e;',
				},
			},
			code: {
				HTMLAttributes: {
					style:
						'background-color: rgba(0, 67, 181, 0.08); padding: 2px 6px; border-radius: 8px; font-family: "SFMono-Regular", "SFMono", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace; font-size: 0.94em; color: #7e3900;',
				},
			},
			heading: {
				HTMLAttributes: {
					style:
						'margin-top: 1.65em; margin-bottom: 0.75em; font-weight: 700; color: #131b2e; letter-spacing: -0.02em; font-family: "Manrope", sans-serif;',
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
	const [editingTitle, setEditingTitle] = useState<string>("");
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
		setEditingTitle(data.title);
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
		onUpdate: ({ editor: currentEditor }) => {
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
			saveTimerRef.current = setTimeout(() => {
				saveDocument(currentEditor.getJSON());
			}, AUTOSAVE_DELAY);
		},
	});

	const toolbarState =
		useEditorState({
			editor,
			selector: ({ editor: currentEditor }) => ({
				isBold: currentEditor?.isActive("bold") ?? false,
				isItalic: currentEditor?.isActive("italic") ?? false,
				isStrike: currentEditor?.isActive("strike") ?? false,
				isCode: currentEditor?.isActive("code") ?? false,
				isParagraph: currentEditor?.isActive("paragraph") ?? false,
				isHeading1:
					currentEditor?.isActive("heading", { level: 1 }) ?? false,
				isHeading2:
					currentEditor?.isActive("heading", { level: 2 }) ?? false,
				isHeading3:
					currentEditor?.isActive("heading", { level: 3 }) ?? false,
				isBulletList: currentEditor?.isActive("bulletList") ?? false,
				isOrderedList: currentEditor?.isActive("orderedList") ?? false,
				isCodeBlock: currentEditor?.isActive("codeBlock") ?? false,
				isBlockquote: currentEditor?.isActive("blockquote") ?? false,
				canUndo: currentEditor
					? currentEditor.can().chain().undo().run()
					: false,
				canRedo: currentEditor
					? currentEditor.can().chain().redo().run()
					: false,
			}),
			equalityFn: (prev, next) => {
				if (!prev || !next) return false;
				return (
					prev.isBold === next.isBold &&
					prev.isItalic === next.isItalic &&
					prev.isStrike === next.isStrike &&
					prev.isCode === next.isCode &&
					prev.isParagraph === next.isParagraph &&
					prev.isHeading1 === next.isHeading1 &&
					prev.isHeading2 === next.isHeading2 &&
					prev.isHeading3 === next.isHeading3 &&
					prev.isBulletList === next.isBulletList &&
					prev.isOrderedList === next.isOrderedList &&
					prev.isCodeBlock === next.isCodeBlock &&
					prev.isBlockquote === next.isBlockquote &&
					prev.canUndo === next.canUndo &&
					prev.canRedo === next.canRedo
				);
			},
		}) ?? DEFAULT_TOOLBAR_STATE;

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
			const response = await fetch(`${API_BASE_URL}/documents/${docId}/public`, {
				method: "DELETE",
				credentials: "include",
			});

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

	const saveTitle = useCallback(async () => {
		const trimmed = editingTitle.trim();
		if (!docId || !trimmed || trimmed === docData?.title) return;
		try {
			const res = await fetch(`${API_BASE_URL}/documents/update`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ id: Number(docId), title: trimmed }),
			});
			if (!res.ok) throw new Error("Save title failed");
			setDocData((prev) => (prev ? { ...prev, title: trimmed } : prev));
			showActionMessage("success", "标题已保存");
		} catch (err) {
			console.error("Save title failed:", err);
			showActionMessage("error", "标题保存失败");
		}
	}, [docId, editingTitle, docData?.title, showActionMessage]);

	const displayTitle = editingTitle.trim() || docData?.title || "Untitled page";
	const breadcrumbItems = ["Workspace", "Knowledge Base", displayTitle];
	const collabLabel = collaborators > 1 ? `${collaborators} 人正在编辑` : "";
	const actionMessageClassName =
		actionMessage?.tone === "error"
			? styles.actionMessageError
			: actionMessage?.tone === "info"
				? styles.actionMessageInfo
				: styles.actionMessageSuccess;
	const saveStatusClassName =
		saveStatus === "error"
			? styles.statusError
			: saveStatus === "saving"
				? styles.statusSaving
				: styles.statusSaved;
	const favoriteItems = useMemo(
		() => [
			{
				title: displayTitle,
				description: "Current draft",
			},
			{
				title: "Research Roundup",
				description: "Collected references",
			},
			{
				title: "Quarterly Planning",
				description: "Team decision log",
			},
		],
		[displayTitle],
	);
	const visibleCollaborators = useMemo(() => {
		const items = [{ initials: getInitials(user?.name || "Me"), name: "You" }];
		const extraCount = Math.max(collaborators - 1, 0);

		for (let index = 0; index < Math.min(extraCount, 2); index += 1) {
			items.push({
				initials: `C${index + 1}`,
				name: `Collaborator ${index + 1}`,
			});
		}

		return items;
	}, [collaborators, user?.name]);
	const hiddenCollaboratorCount = Math.max(
		collaborators - visibleCollaborators.length,
		0,
	);
	const toolbarGroups = editor
		? [
				[
					{
						active: toolbarState.isParagraph,
						icon: "notes",
						label: "正文",
						onClick: () => editor.chain().focus().setParagraph().run(),
					},
					{
						active: toolbarState.isHeading1,
						icon: "title",
						label: "H1",
						onClick: () =>
							editor.chain().focus().toggleHeading({ level: 1 }).run(),
					},
					{
						active: toolbarState.isHeading2,
						icon: "format_size",
						label: "H2",
						onClick: () =>
							editor.chain().focus().toggleHeading({ level: 2 }).run(),
					},
					{
						active: toolbarState.isHeading3,
						icon: "text_fields",
						label: "H3",
						onClick: () =>
							editor.chain().focus().toggleHeading({ level: 3 }).run(),
					},
				],
				[
					{
						active: toolbarState.isBold,
						icon: "format_bold",
						label: "粗体",
						onClick: () => editor.chain().focus().toggleBold().run(),
					},
					{
						active: toolbarState.isItalic,
						icon: "format_italic",
						label: "斜体",
						onClick: () => editor.chain().focus().toggleItalic().run(),
					},
					{
						active: toolbarState.isStrike,
						icon: "strikethrough_s",
						label: "删除线",
						onClick: () => editor.chain().focus().toggleStrike().run(),
					},
					{
						active: toolbarState.isCode,
						icon: "code",
						label: "行内代码",
						onClick: () => editor.chain().focus().toggleCode().run(),
					},
				],
				[
					{
						active: toolbarState.isBulletList,
						icon: "format_list_bulleted",
						label: "无序列表",
						onClick: () => editor.chain().focus().toggleBulletList().run(),
					},
					{
						active: toolbarState.isOrderedList,
						icon: "format_list_numbered",
						label: "有序列表",
						onClick: () => editor.chain().focus().toggleOrderedList().run(),
					},
					{
						active: toolbarState.isBlockquote,
						icon: "format_quote",
						label: "引用",
						onClick: () => editor.chain().focus().toggleBlockquote().run(),
					},
					{
						active: toolbarState.isCodeBlock,
						icon: "data_object",
						label: "代码块",
						onClick: () => editor.chain().focus().toggleCodeBlock().run(),
					},
				],
				[
					{
						active: false,
						icon: "ink_eraser",
						label: "清除样式",
						onClick: () => editor.chain().focus().unsetAllMarks().run(),
					},
					{
						active: false,
						icon: "horizontal_rule",
						label: "分割线",
						onClick: () => editor.chain().focus().setHorizontalRule().run(),
					},
					{
						active: false,
						disabled: !toolbarState.canUndo,
						icon: "undo",
						label: "撤销",
						onClick: () => editor.chain().focus().undo().run(),
					},
					{
						active: false,
						disabled: !toolbarState.canRedo,
						icon: "redo",
						label: "重做",
						onClick: () => editor.chain().focus().redo().run(),
					},
				],
			]
		: [];

	return (
		<div className={styles.page}>
			<aside className={styles.sidebar}>
				<div className={styles.sidebarTop}>
					<div className={styles.logoRow}>
						<div className={styles.logoMark}>
							<MaterialIcon className={styles.logoIcon} name="auto_awesome" />
						</div>
						<div>
							<p className={styles.logoTitle}>DocVault</p>
							<p className={styles.logoSubtitle}>协同文档工作台</p>
						</div>
					</div>
					<button className={styles.newPageButton} type="button">
						<MaterialIcon name="add_circle" />
						<span>New Page</span>
					</button>
				</div>

				<section className={styles.sidebarSection}>
					<p className={styles.sidebarLabel}>Navigation</p>
					<div className={styles.navList}>
						{NAV_ITEMS.map((item) => (
							<button
								className={cx(
									styles.navItem,
									item.active && styles.activePill,
								)}
								key={item.label}
								type="button"
							>
								<MaterialIcon name={item.icon} />
								<span>{item.label}</span>
							</button>
						))}
					</div>
				</section>

				<section className={styles.sidebarSection}>
					<div className={styles.sectionHeader}>
						<p className={styles.sidebarLabel}>Favorites</p>
						<span className={styles.sectionCounter}>{favoriteItems.length}</span>
					</div>
					<div className={styles.favoriteList}>
						{favoriteItems.map((item, index) => (
							<button className={styles.favoriteItem} key={item.title} type="button">
								<div className={styles.favoriteIcon}>
									<MaterialIcon
										name={index === 0 ? "description" : "star"}
									/>
								</div>
								<div className={styles.favoriteMeta}>
									<span className={styles.favoriteTitle}>{item.title}</span>
									<span className={styles.favoriteDescription}>
										{item.description}
									</span>
								</div>
							</button>
						))}
					</div>
				</section>

				<div className={styles.sidebarFooter}>
					{SIDEBAR_FOOTER_ITEMS.map((item) => (
						<button className={styles.footerButton} key={item.label} type="button">
							<MaterialIcon name={item.icon} />
							<span>{item.label}</span>
						</button>
					))}
				</div>
			</aside>

			<main className={styles.mainColumn}>
				<header className={cx(styles.glassPanel, styles.headerPanel)}>
					<div className={styles.headerCopy}>
						<div className={styles.breadcrumbs}>
							{breadcrumbItems.map((item, index) => (
								<span className={styles.breadcrumbNode} key={`${item}-${index}`}>
									{index > 0 && (
										<MaterialIcon
											className={styles.breadcrumbDivider}
											name="chevron_right"
										/>
									)}
									<span
										className={
											index === breadcrumbItems.length - 1
												? styles.breadcrumbCurrent
												: undefined
										}
									>
										{item}
									</span>
								</span>
							))}
						</div>
						<h1 className={styles.headerTitle}>{displayTitle}</h1>
						<p className={styles.headerSubtitle}>
							现代化的协作文档编辑器，内置 AI Agent 与 RAG 知识库关联功能
						</p>
					</div>

					<div className={styles.headerActions}>
						<div className={styles.avatarStack}>
							{visibleCollaborators.map((person, index) => (
								<div
									className={styles.avatar}
									key={`${person.name}-${index}`}
									title={person.name}
								>
									{person.initials}
								</div>
							))}
							{hiddenCollaboratorCount > 0 && (
								<div className={styles.avatarMore}>+{hiddenCollaboratorCount}</div>
							)}
						</div>
						{collabLabel && (
							<span className={cx(styles.statusBadge, styles.statusInfo)}>
								{collabLabel}
							</span>
						)}
						<button
							className={styles.primaryButton}
							disabled={!canManageSharing}
							onClick={() => setShareDrawerOpen(true)}
							type="button"
						>
							<MaterialIcon name="share" />
							<span>Share</span>
						</button>
					</div>
				</header>

				{actionMessage && (
					<div className={cx(styles.actionMessage, actionMessageClassName)}>
						<MaterialIcon
							name={actionMessage.tone === "error" ? "error" : "info"}
						/>
						<span>{actionMessage.text}</span>
					</div>
				)}

				<div className={cx(styles.glassPanel, styles.toolbarPanel)}>
					<div className={styles.toolbarContent}>
						<div className={styles.toolbarGroups}>
							{editor ? (
								toolbarGroups.map((group, index) => (
									<div className={styles.toolbarGroup} key={`group-${index}`}>
										{group.map((item) => (
											<ToolbarButton
												active={item.active}
												disabled={item.disabled}
												icon={item.icon}
												key={item.label}
												label={item.label}
												onClick={item.onClick}
											/>
										))}
									</div>
								))
							) : (
								<p className={styles.toolbarLoading}>编辑器初始化中...</p>
							)}
						</div>

						<div className={styles.toolbarMeta}>
							<span className={cx(styles.statusBadge, saveStatusClassName)}>
								{getSaveStatusLabel(saveStatus)}
							</span>
							<button
								className={styles.secondaryButton}
								disabled={isImporting}
								onClick={() => setImportModalOpen(true)}
								type="button"
							>
								<MaterialIcon name="upload_file" />
								<span>{isImporting ? "导入中..." : "Import MD"}</span>
							</button>
							<button
								className={styles.secondaryButton}
								disabled={!docData || exportingFormat !== null}
								onClick={() => void handleExport("markdown")}
								type="button"
							>
								<MaterialIcon name="download" />
								<span>
									{exportingFormat === "markdown"
										? "导出 Markdown..."
										: "Export MD"}
								</span>
							</button>
							<button
								className={styles.secondaryButton}
								disabled={!docData || exportingFormat !== null}
								onClick={() => void handleExport("pdf")}
								type="button"
							>
								<MaterialIcon name="picture_as_pdf" />
								<span>
									{exportingFormat === "pdf" ? "导出 PDF..." : "Export PDF"}
								</span>
							</button>
						</div>
					</div>
				</div>

				<section className={styles.documentPanel}>
					{!docData ? (
						<div className={styles.skeletonPanel}>
							<div className={styles.skeletonTag} />
							<div className={styles.skeletonTitle} />
							<div className={styles.skeletonRow} />
							<div className={styles.skeletonRow} />
							<div className={styles.skeletonRowShort} />
						</div>
					) : (
						<>
							<div className={styles.documentHeaderBlock}>
								<div className={styles.documentTagRow}>
									<span className={styles.documentTag}>Cloud Doc</span>
									{publicShareUrl && (
										<button
											className={styles.inlineAction}
											onClick={() => void handleCopyPublicUrl()}
											type="button"
										>
											<MaterialIcon name="link" />
											<span>Copy Public Link</span>
										</button>
									)}
								</div>
								<input
									className={styles.titleInput}
									onBlur={() => void saveTitle()}
									onChange={(event) => setEditingTitle(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											(event.target as HTMLInputElement).blur();
										}
									}}
									placeholder="输入文档标题..."
									type="text"
									value={editingTitle}
								/>
								<div className={styles.documentMetaRow}>
									<span className={styles.metaPill}>
										<MaterialIcon name="database" />
										<span>Knowledge Base</span>
									</span>
									<span className={styles.metaPill}>
										<MaterialIcon name="sync" />
										<span>
											{saveStatus === "saving"
												? "Changes syncing"
												: "Live autosave enabled"}
										</span>
									</span>
									<span className={styles.metaPill}>
										<MaterialIcon name="person" />
										<span>{canManageSharing ? "Owner access" : "Shared access"}</span>
									</span>
								</div>
							</div>

							<div className={styles.editorViewport}>
								<div className={styles.editorCanvas}>
									{editor ? (
										<EditorContent
											className={styles.editorContent}
											editor={editor}
										/>
									) : (
										<div className={styles.editorLoading}>
											正在准备编辑器...
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</section>
			</main>

			<aside className={cx(styles.glassPanel, styles.assistantPanel)}>
				<div className={styles.assistantHeader}>
					<div>
						<p className={styles.sidebarLabel}>Assistant</p>
						<h2 className={styles.assistantTitle}>Curator Assistant</h2>
					</div>
					<div className={styles.assistantIndicator}>
						<span className={styles.statusDot} />
						<span>Active</span>
					</div>
				</div>

				<div className={styles.chatThread}>
					<div className={styles.chatRowUser}>
						<div className={styles.chatLabel}>You</div>
						<div className={cx(styles.chatBubble, styles.chatBubbleUser)}>
							Can you turn "{displayTitle}" into a concise decision memo for the
							team review?
						</div>
					</div>

					<div className={styles.chatRowAssistant}>
						<div className={styles.chatLabel}>Curator</div>
						<div className={cx(styles.chatBubble, styles.chatBubbleAssistant)}>
							I would compress the current draft into three sections: key
							argument, supporting references, and open questions. Then I would
							preserve links back to the source blocks so collaborators can verify
							every claim quickly.
						</div>
					</div>
				</div>

				<div className={styles.assistantComposer}>
					<textarea
						className={styles.assistantInput}
						placeholder="Ask Curator to summarize, rewrite, or extract action items..."
					/>
					<div className={styles.assistantComposerFooter}>
						<div className={styles.toolButtonRow}>
							<button className={styles.iconButton} type="button">
								<MaterialIcon name="attach_file" />
								<span>attach_file</span>
							</button>
							<button className={styles.iconButton} type="button">
								<MaterialIcon name="image" />
								<span>image</span>
							</button>
						</div>
						<div className={styles.modelStatus}>
							<span className={styles.statusDot} />
							<span>curator-docs-rag · synced</span>
						</div>
					</div>
				</div>
			</aside>

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
