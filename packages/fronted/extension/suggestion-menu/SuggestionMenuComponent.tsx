import type React from "react";
import type { Group, SuggestionMenuComponentProps, Command } from "./type";

const SuggestionMenuComponent: React.FC<SuggestionMenuComponentProps> = ({
	items,
	anchorRect,
	onSelect,
	editor,
}) => {
	const handleItemClick = (command: Command) => {
		// 跳过需要隐藏的命令
		if (command.shouldBeHidden?.(editor) === true) return;
		const { state, view } = editor;
		const { $head } = state.selection;

		// 获取当前光标所在的段落（block）的起始和结束位置
		const paragraphStart = $head.start();
		const paragraphEnd = $head.end();

		// 删除触发字符
		const tr = state.tr.deleteRange(paragraphStart, paragraphEnd);
		view.dispatch(tr);
		view.focus();
		onSelect(command);
	};

	const renderCommand = (command: Command) => {
		const isHidden = command.shouldBeHidden?.(editor) === true;
		return (
			<div
				key={command.name}
				className="suggestion-command"
				style={{
					padding: "10px 16px",
					cursor: isHidden ? "default" : "pointer",
					borderBottom: "1px solid #f5f5f5",
					opacity: isHidden ? 0.5 : 1,
					pointerEvents: isHidden ? "none" : "auto",
					display: "flex", // 启用flex布局
					alignItems: "center", // 图标和文字垂直居中
				}}
				onClick={() => handleItemClick(command)}
			>
				<div
					style={{
						marginRight: "8px",
						fontSize: "16px",
					}}
				>
					{command.icon}
				</div>
				<div
					style={{
						fontSize: "14px",
						fontWeight: 500,
						color: "#333",
					}}
				>
					{command.name}
				</div>
			</div>
		);
	};

	const renderGroup = (group: Group) => {
		const validCommands = group.commands.filter(
			(cmd) => cmd.shouldBeHidden?.(editor) !== true,
		);
		if (validCommands.length === 0) return null;

		return (
			<div key={group.name} className="suggestion-group">
				<div
					style={{
						fontSize: "12px",
						color: "#999",
						padding: "8px 16px",
						textTransform: "uppercase",
						letterSpacing: 0.5,
					}}
				>
					{group.title}
				</div>
				{validCommands.map(renderCommand)}
			</div>
		);
	};
	const hasValidGroups = items.some((group) =>
		group.commands.some((cmd) => cmd.shouldBeHidden?.(editor) !== true),
	);
	if (!hasValidGroups || !anchorRect) return null;

	return (
		<div
			className="suggestion-menu-container"
			style={{
				position: "absolute",
				top: anchorRect.bottom + 4,
				left: anchorRect.left,
				width: "300px",
				background: "white",
				border: "1px solid #e5e7eb",
				borderRadius: "8px",
				boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
				zIndex: 10000,
				maxHeight: "360px",
				overflowY: "auto",
				boxSizing: "border-box",
				marginTop: "2px",
			}}
		>
			{items.map(renderGroup)}
		</div>
	);
};

export default SuggestionMenuComponent;
