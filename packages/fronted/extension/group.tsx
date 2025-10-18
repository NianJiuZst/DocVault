import type { Group } from "./suggestion-menu/type";
import {
	RiH1,
	RiH2,
	RiH3,
	RiH4,
	RiCodeBlock,
	RiDoubleQuotesL,
} from "react-icons/ri";
import { GrUnorderedList, GrOrderedList } from "react-icons/gr";
import { FcTodoList } from "react-icons/fc";
import { IoLogoYoutube } from "react-icons/io5";
const ExtensionGroups: Group[] = [
	{
		name: "Basic effect",
		title: "基础",
		commands: [
			{
				name: "一级标题",
				icon: <RiH1 style={{ color: "blue" }} />,
				action: (editor) => {
					editor.chain().focus().setHeading({ level: 1 }).run();
				},
			},
			{
				name: "二级标题",
				icon: <RiH2 style={{ color: "blue" }} />,
				action: (editor) => {
					editor.chain().focus().setHeading({ level: 2 }).run();
				},
			},
			{
				name: "三级标题",
				icon: <RiH3 style={{ color: "blue" }} />,
				action: (editor) => {
					editor.chain().focus().setHeading({ level: 3 }).run();
				},
			},
			{
				name: "四级标题",
				icon: <RiH4 style={{ color: "blue" }} />,
				action: (editor) => {
					editor.chain().focus().setHeading({ level: 4 }).run();
				},
			},
			{
				name: "无序列表",
				icon: <GrUnorderedList style={{ color: "blue" }} />,
				action: (editor) => {
					editor.chain().focus().toggleBulletList().run();
				},
			},
			{
				name: "有序列表",
				icon: <GrOrderedList style={{ color: "blue" }} />,
				action: (editor) => {
					editor.chain().focus().toggleOrderedList().run();
				},
			},
			{
				name: "任务列表",
				icon: <FcTodoList style={{ color: "blue" }} />,
				action: (editor) => {
					editor.chain().focus().toggleTaskList().run();
				},
			},
			{
				name: "引用",
				icon: <RiDoubleQuotesL style={{ color: "blue" }} />,
				action: (editor) => {
					editor.chain().focus().setBlockquote().run();
				},
			},
			{
				name: "代码块",
				icon: <RiCodeBlock style={{ color: "blue" }} />,
				shouldBeHidden: (editor) => editor.isActive("columns"),
				action: (editor) => {
					editor.chain().focus().toggleCodeBlock().run();
				},
			},
		],
	},
	{
		name: "Advanced effect",
		title: "高级",
		commands: [
			{
				name: "插入 YouTube 视频",
				icon: <IoLogoYoutube style={{ color: "red" }} />,
				action: () => {
					window.dispatchEvent(new Event("openYouTubeModal"));
				},
			},
		],
	},
];

export default ExtensionGroups;
