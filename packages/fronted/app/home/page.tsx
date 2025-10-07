export default function HomePage() {
	return (
		<div
			style={{
				height: "100%",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				position: "relative",
			}}
		>
			<div className="absolute inset-8 rounded-2xl backdrop-blur-sm flex items-center justify-center">
				<div className="text-center p-8 max-w-2xl">
					<h2
						className="text-3xl font-bold mb-4 tracking-tight"
						style={{ color: "rgb(76, 108, 144)" }}
					>
						🌿 欢迎使用 Doc Vault
					</h2>
					<p
						className="text-lg leading-relaxed mb-6"
						style={{ color: "rgb(96, 92, 88)", opacity: 0.9 }}
					>
						一个优雅、宁静、高效的文档与协作空间。
						点击左侧菜单，开启你的数字之旅。
					</p>
				</div>
			</div>
		</div>
	);
}
