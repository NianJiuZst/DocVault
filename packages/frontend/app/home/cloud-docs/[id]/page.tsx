"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import StarterKit from "@tiptap/starter-kit";
import { SuggestionMenu } from "@/extension/suggestion-menu/SuggestionMenu";
import { YoutubeExtension } from "@/extension/YouTube/YouTube";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";

const AUTOSAVE_DELAY = 2000;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";

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

function MenuBar({ editor }: { editor: Editor }) {
	const editorState = useEditorState({
		editor,
		selector: (ctx) => ({
			isBold: ctx.editor.isActive("bold") ?? false,
			canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
			isItalic: ctx.editor.isActive("italic") ?? false,
			canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
			isStrike: ctx.editor.isActive("strike") ?? false,
			canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
			isCode: ctx.editor.isActive("code") ?? false,
			canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
			canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
			isParagraph: ctx.editor.isActive("paragraph") ?? false,
			isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
			isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
			isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
			isBulletList: ctx.editor.isActive("bulletList") ?? false,
			isOrderedList: ctx.editor.isActive("orderedList") ?? false,
			isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
			isBlockquote: ctx.editor.isActive("blockquote") ?? false,
			canUndo: ctx.editor.can().chain().undo().run() ?? false,
			canRedo: ctx.editor.can().chain().redo().run() ?? false,
		}),
		equalityFn: (prev, next) => {
			if (!prev || !next) return false;
			return (
				prev.isBold === next.isBold &&
				prev.canBold === next.canBold &&
				prev.isItalic === next.isItalic &&
				prev.canItalic === next.canItalic &&
				prev.isStrike === next.isStrike &&
				prev.canStrike === next.canStrike &&
				prev.isCode === next.isCode &&
				prev.canCode === next.canCode &&
				prev.canClearMarks === next.canClearMarks &&
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
	});

	if (!editor) return null;

	return (
		<div
			className="control-group"
			style={{
				marginBottom: "1rem",
				padding: "0.5rem",
				borderBottom: "1px solid #eee",
			}}
		>
			<div
				className="button-group"
				style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
			>
				<button
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={!editorState.canBold}
					className={editorState.isBold ? "is-active" : ""}
					style={getButtonStyle(editorState.isBold)}
				>
					Bold
				</button>
				<button
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={!editorState.canItalic}
					className={editorState.isItalic ? "is-active" : ""}
					style={getButtonStyle(editorState.isItalic)}
				>
					Italic
				</button>
				<button
					onClick={() => editor.chain().focus().toggleStrike().run()}
					disabled={!editorState.canStrike}
					className={editorState.isStrike ? "is-active" : ""}
					style={getButtonStyle(editorState.isStrike)}
				>
					Strike
				</button>
				<button
					onClick={() => editor.chain().focus().toggleCode().run()}
					disabled={!editorState.canCode}
					className={editorState.isCode ? "is-active" : ""}
					style={getButtonStyle(editorState.isCode)}
				>
					Code
				</button>
				<button
					onClick={() => editor.chain().focus().unsetAllMarks().run()}
					style={getButtonStyle(false)}
				>
					Clear marks
				</button>
				<button
					onClick={() => editor.chain().focus().clearNodes().run()}
					style={getButtonStyle(false)}
				>
					Clear nodes
				</button>
				<button
					onClick={() => editor.chain().focus().setParagraph().run()}
					className={editorState.isParagraph ? "is-active" : ""}
					style={getButtonStyle(editorState.isParagraph)}
				>
					Paragraph
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className={editorState.isHeading1 ? "is-active" : ""}
					style={getButtonStyle(editorState.isHeading1)}
				>
					H1
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={editorState.isHeading2 ? "is-active" : ""}
					style={getButtonStyle(editorState.isHeading2)}
				>
					H2
				</button>
				<button
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					className={editorState.isHeading3 ? "is-active" : ""}
					style={getButtonStyle(editorState.isHeading3)}
				>
					H3
				</button>
				<button
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editorState.isBulletList ? "is-active" : ""}
					style={getButtonStyle(editorState.isBulletList)}
				>
					Bullet list
				</button>
				<button
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editorState.isOrderedList ? "is-active" : ""}
					style={getButtonStyle(editorState.isOrderedList)}
				>
					Ordered list
				</button>
				<button
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					className={editorState.isCodeBlock ? "is-active" : ""}
					style={getButtonStyle(editorState.isCodeBlock)}
				>
					Code block
				</button>
				<button
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={editorState.isBlockquote ? "is-active" : ""}
					style={getButtonStyle(editorState.isBlockquote)}
				>
					Blockquote
				</button>
				<button
					onClick={() => editor.chain().focus().setHorizontalRule().run()}
					style={getButtonStyle(false)}
				>
					Horizontal rule
				</button>
				<button
					onClick={() => editor.chain().focus().undo().run()}
					disabled={!editorState.canUndo}
					style={getButtonStyle(false, !editorState.canUndo)}
				>
					Undo
				</button>
				<button
					onClick={() => editor.chain().focus().redo().run()}
					disabled={!editorState.canRedo}
					style={getButtonStyle(false, !editorState.canRedo)}
				>
					Redo
				</button>
			</div>
		</div>
	);
}

const getButtonStyle = (isActive: boolean, disabled = false) => ({
	padding: "0.3rem 0.6rem",
	border: "1px solid #ddd",
	borderRadius: "4px",
	background: isActive ? "#0070f3" : "white",
	color: isActive ? "white" : "black",
	cursor: disabled ? "not-allowed" : "pointer",
	opacity: disabled ? 0.6 : 1,
});

export default function DocEditor() {
	const params = useParams();
	const docId = params.id as string;
	const [docData, setDocData] = useState<{ title: string; content: any } | null>(null);
	const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
	const [collaborators, setCollaborators] = useState<number>(0);
	const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
	const yDocRef = useRef<Y.Doc>(new Y.Doc());
	const providerRef = useRef<HocuspocusProvider | null>(null);

	const saveDocument = useCallback(
		async (content: any) => {
			if (!docId) return;
			setSaveStatus("saving");
			try {
				const res = await fetch("http://localhost:3001/documents/update", {
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

	useEffect(() => {
		if (!docId) return;

		// Connect WebSocket collaboration
		fetch("http://localhost:3001/auth/token", { credentials: "include" })
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
		fetch(`http://localhost:3001/documents/${docId}`, { credentials: "include" })
			.then((r) => r.json())
			.then((data) => {
				if (data && data.id) {
					setDocData({ title: data.title, content: data.content });
				}
			})
			.catch(console.error);

		return () => {
			providerRef.current?.destroy();
		};
	}, [docId]);

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
	}, [docData, editor]);

	const statusLabel =
		saveStatus === "saving"
			? "保存中..."
			: saveStatus === "error"
				? "保存失败"
				: "已保存";
	const collabLabel = collaborators > 1 ? `${collaborators} 人正在编辑` : "";

	return (
		<div className="w-full h-[calc(100vh-2rem)] p-4 bg-white flex flex-col">
			<div className="flex items-center justify-between mb-2">
				{editor && <MenuBar editor={editor} />}
				<div className="flex items-center gap-4">
					{collabLabel && (
						<span className="text-sm text-blue-500">{collabLabel}</span>
					)}
					<span
						className={`text-sm ${
							saveStatus === "error"
								? "text-red-500"
								: saveStatus === "saving"
									? "text-yellow-500"
									: "text-green-500"
						}`}
					>
						{statusLabel}
					</span>
				</div>
			</div>
			<div className="flex-1 relative">
				<div className="h-full overflow-y-auto relative w-full outline-none">
					<EditorContent
						editor={editor}
						className="prose-container h-full pl-14 outline-none border-none"
					/>
				</div>
			</div>
		</div>
	);
}
