"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
	MdFormatBold,
	MdFormatItalic,
	MdFormatStrikethrough,
	MdCode,
	MdTitle,
	MdFormatListBulleted,
	MdFormatListNumbered,
	MdFormatQuote,
	MdHorizontalRule,
	MdUndo,
	MdRedo,
	MdTextFields,
} from "react-icons/md";

function ToolbarButton({
	icon,
	onClick,
	active = false,
	disabled = false,
	title,
}: {
	icon: React.ReactNode;
	onClick: () => void;
	active?: boolean;
	disabled?: boolean;
	title: string;
}) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			title={title}
			type="button"
			className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
				active
					? "bg-blue-100 text-blue-600"
					: "text-gray-600 hover:bg-gray-100"
			} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
		>
			{icon}
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
		<div className="flex items-center gap-0.5 flex-wrap">
			<ToolbarButton
				icon={<MdFormatBold size={16} />}
				onClick={() => editor.chain().focus().toggleBold().run()}
				active={editorState.isBold}
				disabled={!editorState.canBold}
				title="粗体"
			/>
			<ToolbarButton
				icon={<MdFormatItalic size={16} />}
				onClick={() => editor.chain().focus().toggleItalic().run()}
				active={editorState.isItalic}
				disabled={!editorState.canItalic}
				title="斜体"
			/>
			<ToolbarButton
				icon={<MdFormatStrikethrough size={16} />}
				onClick={() => editor.chain().focus().toggleStrike().run()}
				active={editorState.isStrike}
				disabled={!editorState.canStrike}
				title="删除线"
			/>
			<ToolbarButton
				icon={<MdCode size={16} />}
				onClick={() => editor.chain().focus().toggleCode().run()}
				active={editorState.isCode}
				disabled={!editorState.canCode}
				title="行内代码"
			/>

			<div className="w-px h-5 bg-gray-200 mx-1" />

			<ToolbarButton
				icon={<MdTextFields size={16} />}
				onClick={() => editor.chain().focus().setParagraph().run()}
				active={editorState.isParagraph}
				title="正文"
			/>
			<ToolbarButton
				icon={<MdTitle size={16} style={{ fontSize: 18 }} />}
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				active={editorState.isHeading1}
				title="标题1"
			/>
			<ToolbarButton
				icon={<MdTitle size={14} />}
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				active={editorState.isHeading2}
				title="标题2"
			/>
			<ToolbarButton
				icon={<MdTitle size={12} />}
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				active={editorState.isHeading3}
				title="标题3"
			/>

			<div className="w-px h-5 bg-gray-200 mx-1" />

			<ToolbarButton
				icon={<MdFormatListBulleted size={16} />}
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				active={editorState.isBulletList}
				title="无序列表"
			/>
			<ToolbarButton
				icon={<MdFormatListNumbered size={16} />}
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				active={editorState.isOrderedList}
				title="有序列表"
			/>
			<ToolbarButton
				icon={<MdFormatQuote size={16} />}
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				active={editorState.isBlockquote}
				title="引用"
			/>
			<ToolbarButton
				icon={<MdHorizontalRule size={16} />}
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				title="分割线"
			/>

			<div className="w-px h-5 bg-gray-200 mx-1" />

			<ToolbarButton
				icon={<MdUndo size={16} />}
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editorState.canUndo}
				title="撤销"
			/>
			<ToolbarButton
				icon={<MdRedo size={16} />}
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editorState.canRedo}
				title="重做"
			/>
		</div>
	);
}
