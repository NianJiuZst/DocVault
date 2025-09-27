import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
	title: "DocVault",
	description:
		" Tiptap+Next.js 15 打造现代化协同文档编辑器，内置 AI Agent 与 RAG 知识库关联功能",
	authors: [
		{ name: "DocVault", url: "https://github.com/NianJiuZst/DocVault" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
