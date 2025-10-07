"use client";

export default function SearchBar() {
	return (
		<div className="relative w-96">
			<input
				type="text"
				placeholder="🔍 搜索文档、消息或日程..."
				className="w-full py-3 pl-12 pr-5 rounded-xl font-medium text-gray-800 placeholder-gray-500 transition-all duration-300 focus:ring-0"
				style={{
					backgroundColor: "rgb(255, 255, 255)",
					color: "rgb(96, 92, 88)",
					border: "1px solid rgb(160, 147, 252)",
					boxShadow: "0 1px 4px rgba(160, 147, 252, 0.2)",
				}}
				onFocus={(e) => {
					e.currentTarget.style.boxShadow =
						"0 2px 8px rgba(160, 147, 252, 0.3)";
					e.currentTarget.style.transform = "scale(1.01)";
				}}
				onBlur={(e) => {
					e.currentTarget.style.boxShadow =
						"0 1px 4px rgba(160, 147, 252, 0.2)";
					e.currentTarget.style.transform = "scale(1)";
				}}
			/>
		</div>
	);
}
