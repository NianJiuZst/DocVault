import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import type {
	SuggestionProps,
	SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import SuggestionMenuComponent from "./SuggestionMenuComponent";
import type { Group, Command } from "./type";
import GROUPS from "./group";
export const SuggestionMenu = Extension.create({
	name: "SuggestionMenu",
	priority: 200,

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				char: "/",
				allowSpaces: true,
				startOfLine: true,
				pluginKey: new PluginKey("SuggestionMenu"),
				allow: ({ state, range }) => {
					const $from = state.doc.resolve(range.from);
					// 仅当当前节点类型为段落（`paragraph`）时返回true，否则不触发提示
					return $from.parent.type.name === "paragraph";
				},
				items: ({ query }: { query: string }): Group[] => {
					return GROUPS.map(
						(group): Group => ({
							...group,
							commands: group.commands
								.filter((item) => {
									const nameNormalized = item.name.trim();
									const queryNormalized = query.trim();
									return nameNormalized.includes(queryNormalized);
								})
								.filter((command) =>
									command.shouldBeHidden
										? !command.shouldBeHidden(this.editor)
										: true,
								),
						}),
					).filter((group) => group.commands.length > 0);
				},
				render: () => {
					let component: ReactRenderer;
					let scrollHandler: (() => void) | null = null;

					return {
						onStart: (props: SuggestionProps) => {
							const { view } = props.editor;
							const getReferenceClientRect = () => {
								if (!props.clientRect) return undefined;
								const rect = props.clientRect();
								if (!rect) return undefined;
								let yPos = rect.y;
								if (rect.top + 300 > window.innerHeight) {
									const diff = rect.top + 300 - window.innerHeight + 40;
									yPos = rect.y - diff;
								}
								return new DOMRect(rect.x, yPos, rect.width, rect.height);
							};

							const anchorRect = getReferenceClientRect();
							component = new ReactRenderer(SuggestionMenuComponent, {
								props: {
									items: props.items as Group[],
									anchorRect,
									editor: props.editor,
									onSelect: (command: Command) => {
										command.action(props.editor);
										component.destroy();
									},
								},
								editor: props.editor,
							});

							if (component.element) {
								document.body.appendChild(component.element);
							}

							scrollHandler = () => {
								const rect = getReferenceClientRect();
								if (rect) {
									component.updateProps({ anchorRect: rect });
								}
							};

							view.dom.parentElement?.parentElement?.addEventListener(
								"scroll",
								scrollHandler,
							);
							view.focus();
						},

						onUpdate: (props: SuggestionProps) => {
							const getReferenceClientRect = () => {
								if (!props.clientRect) return undefined;
								const rect = props.clientRect();
								if (!rect) return undefined;
								let yPos = rect.y;
								if (rect.top + 300 > window.innerHeight) {
									const diff = rect.top + 300 - window.innerHeight + 40;
									yPos = rect.y - diff;
								}
								return new DOMRect(rect.x, yPos, rect.width, rect.height);
							};

							const anchorRect = getReferenceClientRect();
							component?.updateProps({ items: props.items, anchorRect });
						},

						onKeyDown: (props: SuggestionKeyDownProps) => {
							if (props.event.key === "Escape") {
								component?.destroy();
								return true;
							}
							return false;
						},

						onExit: (props: SuggestionProps) => {
							if (scrollHandler) {
								props.editor.view.dom.parentElement?.parentElement?.removeEventListener(
									"scroll",
									scrollHandler,
								);
							}
							component?.destroy();
						},
					};
				},
			}),
		];
	},
});
