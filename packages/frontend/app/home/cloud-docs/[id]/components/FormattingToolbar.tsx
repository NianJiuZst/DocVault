"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";

function ToolbarButton({
	label,
	onClick,
	active = false,
	disabled = false,
}: {
	label: string;
	onClick: () => void;
	active?: boolean;
	disabled?: boolean;
}) {
	const className = [
		"inline-flex min-h-9 items-center rounded-lg border px-3 text-sm font-medium transition-colors",
		active
			? "border-blue-600 bg-blue-600 text-white"
			: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
		disabled ? "cursor-not-allowed opacity-50 hover:bg-white" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button
			className={className}
			disabled={disabled}
			onClick={onClick}
			type="button"
		>
			{label}
		</button>
	);
}

export default function FormattingToolbar({ editor }: { editor: Editor }) {
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

	return (
		<div className="flex flex-wrap gap-2">
			<ToolbarButton
				active={editorState.isBold}
				disabled={!editorState.canBold}
				label="粗体"
				onClick={() => editor.chain().focus().toggleBold().run()}
			/>
			<ToolbarButton
				active={editorState.isItalic}
				disabled={!editorState.canItalic}
				label="斜体"
				onClick={() => editor.chain().focus().toggleItalic().run()}
			/>
			<ToolbarButton
				active={editorState.isStrike}
				disabled={!editorState.canStrike}
				label="删除线"
				onClick={() => editor.chain().focus().toggleStrike().run()}
			/>
			<ToolbarButton
				active={editorState.isCode}
				disabled={!editorState.canCode}
				label="行内代码"
				onClick={() => editor.chain().focus().toggleCode().run()}
			/>
			<ToolbarButton
				label="清除样式"
				onClick={() => editor.chain().focus().unsetAllMarks().run()}
			/>
			<ToolbarButton
				label="清除节点"
				onClick={() => editor.chain().focus().clearNodes().run()}
			/>
			<ToolbarButton
				active={editorState.isParagraph}
				label="正文"
				onClick={() => editor.chain().focus().setParagraph().run()}
			/>
			<ToolbarButton
				active={editorState.isHeading1}
				label="H1"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
			/>
			<ToolbarButton
				active={editorState.isHeading2}
				label="H2"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			/>
			<ToolbarButton
				active={editorState.isHeading3}
				label="H3"
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
			/>
			<ToolbarButton
				active={editorState.isBulletList}
				label="无序列表"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
			/>
			<ToolbarButton
				active={editorState.isOrderedList}
				label="有序列表"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
			/>
			<ToolbarButton
				active={editorState.isCodeBlock}
				label="代码块"
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
			/>
			<ToolbarButton
				active={editorState.isBlockquote}
				label="引用"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
			/>
			<ToolbarButton
				label="分割线"
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
			/>
			<ToolbarButton
				disabled={!editorState.canUndo}
				label="撤销"
				onClick={() => editor.chain().focus().undo().run()}
			/>
			<ToolbarButton
				disabled={!editorState.canRedo}
				label="重做"
				onClick={() => editor.chain().focus().redo().run()}
			/>
		</div>
	);
}
