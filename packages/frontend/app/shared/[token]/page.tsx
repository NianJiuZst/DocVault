"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { YoutubeExtension } from "@/extension/YouTube/YouTube";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SharedDocument {
	title: string;
	content: any;
}

function buildReadOnlyExtensions() {
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
		TaskItem,
		TaskList,
		YoutubeExtension,
	];
}

export default function SharedDocumentPage() {
	const params = useParams();
	const token = params.token as string;
	const [documentData, setDocumentData] = useState<SharedDocument | null>(null);
	const [status, setStatus] = useState<"loading" | "ready" | "error">(
		"loading",
	);
	const [error, setError] = useState("");

	const editor = useEditor({
		extensions: buildReadOnlyExtensions(),
		immediatelyRender: false,
		injectCSS: false,
		content: "",
		editable: false,
		shouldRerenderOnTransaction: false,
	});

	useEffect(() => {
		if (!token) return;

		const fetchSharedDocument = async () => {
			setStatus("loading");
			setError("");

			try {
				const response = await fetch(
					`${API_BASE_URL}/documents/shared/${token}`,
				);
				if (!response.ok) {
					throw new Error("公开文档不存在或已失效");
				}

				const data = (await response.json()) as SharedDocument;
				setDocumentData(data);
				setStatus("ready");
			} catch (fetchError) {
				console.error(fetchError);
				setStatus("error");
				setError("公开文档不存在或已失效");
			}
		};

		void fetchSharedDocument();
	}, [token]);

	useEffect(() => {
		if (documentData?.content && editor) {
			editor.commands.setContent(documentData.content);
		}
	}, [documentData?.content, editor]);

	return (
		<div className="min-h-screen bg-slate-100 px-4 py-10">
			<div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
				<div className="border-b border-slate-100 pb-6">
					<p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
						Public Share
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-slate-900">
						{documentData?.title || "共享文档"}
					</h1>
				</div>

				{status === "loading" && (
					<div className="py-16 text-center text-slate-500">
						正在加载共享文档...
					</div>
				)}

				{status === "error" && (
					<div className="py-16 text-center text-red-500">{error}</div>
				)}

				{status === "ready" && (
					<div className="pt-8">
						<EditorContent
							className="prose-container min-h-[400px] outline-none"
							editor={editor}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
