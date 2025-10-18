"use client";
import { useParams } from "next/navigation";
import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import StarterKit from "@tiptap/starter-kit";
import { SuggestionMenu } from "@/extension/suggestion-menu/SuggestionMenu";

const Extensions = [
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
];

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
			isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
			isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
			isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
			isBulletList: ctx.editor.isActive("bulletList") ?? false,
			isOrderedList: ctx.editor.isActive("orderedList") ?? false,
			isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
			isBlockquote: ctx.editor.isActive("blockquote") ?? false,
			canUndo: ctx.editor.can().chain().undo().run() ?? false,
			canRedo: ctx.editor.can().chain().redo().run() ?? false,
		}),
		// 自定义相等性检查：仅当订阅的状态真正变化时才触发重渲染
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
				prev.isHeading4 === next.isHeading4 &&
				prev.isHeading5 === next.isHeading5 &&
				prev.isHeading6 === next.isHeading6 &&
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
					onClick={() => editor.chain().focus().setHardBreak().run()}
					style={getButtonStyle(false)}
				>
					Hard break
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
	"&:hover": {
		background: isActive ? "#0051aa" : "#f5f5f5",
	},
});

export default function DocEditor() {
	const params = useParams();
	const docId = params.id as string;

	const editor = useEditor({
		extensions: Extensions,
		immediatelyRender: false,
		injectCSS: false,
		content: `
      <h1>${docId}</h1>
      <p>
        这是文档 <strong>${docId}</strong> 的内容区域，可以使用上方工具栏进行编辑。
      </p>
      <p>
        支持格式化、列表、代码块等功能，尝试使用工具栏按钮进行编辑吧！
      </p>
    `,
		autofocus: true,
		shouldRerenderOnTransaction: false,
	});

	if (!editor) {
		return <div>加载编辑器中...</div>;
	}

	return (
		<div className="w-full h-[calc(100vh-2rem)] p-4 bg-white flex flex-col">
			<MenuBar editor={editor} />
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
