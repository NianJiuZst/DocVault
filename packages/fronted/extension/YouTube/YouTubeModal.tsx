import type React from "react";
import type { Editor } from "@tiptap/react";
import { useState } from "react";
import { TfiYoutube } from "react-icons/tfi";

interface YouTubeModalProps {
	editor: Editor;
	onClose: () => void;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({ editor, onClose }) => {
	const [videoUrl, setVideoUrl] = useState("");
	const [width, setWidth] = useState(560);
	const [height, setHeight] = useState(315);
	const [error, setError] = useState("");
	const validateYouTubeUrl = (url: string): boolean => {
		const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

		return youtubeRegex.test(url);
	};

	const onURLSubmit = async () => {
		if (!validateYouTubeUrl(videoUrl)) {
			setError("请输入有效的 YouTube 视频链接");
			return;
		}
		setError("");
		editor
			.chain()
			.focus()
			.setYoutubeVideo({
				src: videoUrl,
				width: width || 560,
				height: height || 315,
			})
			.run();
		setVideoUrl("");
		setWidth(560);
		setHeight(315);
		onClose();
	};
	return (
		<div>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div
					className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					onClick={onClose}
				/>
				<div
					className="relative bg-white rounded-lg shadow-lg max-h-[80vh] w-full overflow-hidden"
					style={{ width }}
				>
					<div className="flex items-center justify-between p-4 border-b border-gray-100">
						<p
							className="text-lg font-semibold text-gray-900"
							style={{
								display: "flex", // 父元素设为弹性容器，子元素横向排列
								alignItems: "center", // 垂直居中对齐（可选，让图标和文字对齐更美观）
								gap: "8px", // 图标和文字之间的间距（可选，根据需要调整）
							}}
						>
							<TfiYoutube style={{ color: "red", fontSize: "35px" }} />
							插入 YouTube 视频
						</p>
						<button
							className="absolute right-4 top-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
							onClick={onClose}
							aria-label="关闭"
						>
							<span className="text-xl">×</span>
						</button>
					</div>

					{/* 内容区域 */}
					<div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
						<input
							type="text"
							placeholder="请输入 YouTube 视频链接"
							value={videoUrl}
							onChange={(e) => setVideoUrl(e.target.value)}
							className="w-full p-2 border border-gray-300 rounded"
						/>
					</div>

					{/* 底部按钮区 */}
					<div className="flex justify-end gap-3 p-4 border-t border-gray-100">
						<button
							className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-gray-700"
							onClick={onURLSubmit}
						>
							确定
						</button>
					</div>
					<div>
						{error && (
							<div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
								{error}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
export default YouTubeModal;
