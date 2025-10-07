"use client";
import { VscNewFile } from "react-icons/vsc";
import { IoCloudUploadOutline } from "react-icons/io5";
import { CgTemplate } from "react-icons/cg";
import { useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";
// 1. 导入 Next.js 客户端路由钩子
import { useRouter } from "next/navigation";

interface Document {
	id: number;
	name: string;
	author: string;
	lastOpen: string;
}

const documentData: { [key: string]: Document[] } = {
	recent: [
		{
			id: 1,
			name: "产品规划方案2023",
			author: "张明",
			lastOpen: "2023-10-06 14:30",
		},
		{
			id: 2,
			name: "市场调研报告",
			author: "李华",
			lastOpen: "2023-10-05 09:15",
		},
		{
			id: 3,
			name: "项目进度跟踪表",
			author: "王芳",
			lastOpen: "2023-10-04 16:45",
		},
		{
			id: 4,
			name: "季度财务分析",
			author: "赵伟",
			lastOpen: "2023-10-03 11:20",
		},
		{
			id: 5,
			name: "团队周会记录",
			author: "陈静",
			lastOpen: "2023-10-02 15:10",
		},
	],
	shared: [
		{
			id: 6,
			name: "客户需求清单",
			author: "刘敏",
			lastOpen: "2023-10-06 10:05",
		},
		{ id: 7, name: "设计资源库", author: "周强", lastOpen: "2023-10-05 13:40" },
		{
			id: 8,
			name: "测试用例集合",
			author: "吴佳",
			lastOpen: "2023-10-04 08:50",
		},
	],
	favorites: [
		{
			id: 9,
			name: "品牌视觉规范",
			author: "郑亮",
			lastOpen: "2023-10-06 16:20",
		},
		{
			id: 10,
			name: "产品路线图",
			author: "张明",
			lastOpen: "2023-10-05 11:30",
		},
		{
			id: 11,
			name: "用户研究报告",
			author: "孙悦",
			lastOpen: "2023-10-03 09:45",
		},
		{
			id: 12,
			name: "开发规范文档",
			author: "林达",
			lastOpen: "2023-10-01 14:25",
		},
	],
};

export default function CloudDocsPage() {
	const [activeTab, setActiveTab] = useState("recent");
	// 2. 初始化路由实例
	const router = useRouter();
	const handleNewDoc = () => {
		router.push("/home/cloud-docs/1");
	};

	return (
		<div className="min-h-screen bg-white flex justify-start flex-col w-full ">
			<div className="container pl-[4%] py-6 max-w-7xl">
				{/* 第一行：操作按钮 - 给“新建”按钮添加 onClick 事件 */}
				<div className="flex flex-wrap gap-4 mb-8">
					<button
						onClick={handleNewDoc} // 4. 绑定跳转事件
						className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
					>
						<VscNewFile className="h-5 w-5" />
						<span>新建</span>
					</button>
					<button className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
						<IoCloudUploadOutline className="h-5 w-5" />
						<span>上传</span>
					</button>
					<button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
						<CgTemplate className="h-5 w-5" />
						<span>模板库</span>
					</button>
				</div>

				{/* 第二行：选项卡（保持不变） */}
				<div className="border-b border-gray-200 mb-6">
					<div className="flex space-x-8">
						<button
							onClick={() => setActiveTab("recent")}
							className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
								activeTab === "recent"
									? "text-blue-600 border-b-2 border-blue-600"
									: "text-gray-500 hover:text-gray-900"
							}`}
						>
							<span>最近访问</span>
						</button>
						<button
							onClick={() => setActiveTab("shared")}
							className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
								activeTab === "shared"
									? "text-blue-600 border-b-2 border-blue-600"
									: "text-gray-500 hover:text-gray-900"
							}`}
						>
							<span>与我共享</span>
						</button>
						<button
							onClick={() => setActiveTab("favorites")}
							className={`flex items-center gap-2 pb-4 font-medium transition-colors duration-200 ${
								activeTab === "favorites"
									? "text-blue-600 border-b-2 border-blue-600"
									: "text-gray-500 hover:text-gray-900"
							}`}
						>
							<span>收藏</span>
						</button>
					</div>
				</div>

				{/* 文档列表（保持不变） */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
					<div className="divide-y divide-gray-100">
						{documentData[activeTab].map((doc) => (
							<div
								key={doc.id}
								className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
							>
								<div className="flex items-center gap-4">
									<FaRegFileAlt className="h-5 w-5 text-gray-600 mt-0.5" />
									<div>
										<h3 className="font-medium text-gray-900">{doc.name}</h3>
										<p className="text-sm text-gray-500 mt-0.5">
											作者: {doc.author}
										</p>
									</div>
								</div>
								<div className="text-sm text-gray-400">{doc.lastOpen}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
