import type { Editor } from "@tiptap/core";
export interface Command {
	name: string;
	icon: React.ReactNode;
	action: (editor: Editor) => void;
	shouldBeHidden?: (editor: Editor) => boolean;
}

export interface Group {
	name: string;
	title: string;
	commands: Command[];
}

export interface SuggestionMenuComponentProps {
	items: Group[];
	anchorRect: DOMRect | undefined;
	onSelect: (command: Command) => void;
	editor: Editor;
}
