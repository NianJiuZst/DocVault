import Youtube from "@tiptap/extension-youtube";
import { createRoot } from "react-dom/client";
import YouTubeModal from "./YouTubeModal";
import React from "react";

let YouTubeContainer: HTMLElement | null = null;
let YouTubeRoot: ReturnType<typeof createRoot> | null = null;
export const YoutubeExtension = Youtube.extend({
	onCreate() {
		const onOpenYouTubeModal = () => {
			YouTubeContainer = document.createElement("div");
			YouTubeContainer.id = "youtube-container";
			document.body.appendChild(YouTubeContainer);
			YouTubeRoot = createRoot(YouTubeContainer);
			const YouTubeModalComponent = React.createElement(YouTubeModal, {
				editor: this.editor,
				onClose: () => {
					if (YouTubeRoot) YouTubeRoot.render(null);
				},
			});
			YouTubeRoot.render(YouTubeModalComponent);
		};
		window.addEventListener("openYouTubeModal", onOpenYouTubeModal);
		this.storage.clearYouTubeModalListener = () => {
			window.removeEventListener("openYouTubeModal", onOpenYouTubeModal);

			if (YouTubeContainer) {
				document.body.removeChild(YouTubeContainer);
				YouTubeContainer = null;
				YouTubeRoot = null;
			}
		};
	},
	onDestroy() {
		this.storage.clearYouTubeModalListener();
	},
});
