import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
			<h1 className="text-6xl md:text-9xl font-black text-gray-800 dark:text-gray-200 mb-6 tracking-tight">
				404
			</h1>
			<div className="text-center max-w-md mb-10">
				<h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
					页面未找到
				</h2>
				<p className="text-gray-600 dark:text-gray-400">
					抱歉，您请求的页面不存在。
				</p>
			</div>
			<Link
				href="/"
				className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
			>
				<span>返回首页</span>
			</Link>
		</div>
	);
}
