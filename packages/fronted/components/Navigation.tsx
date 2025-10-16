import type React from "react";
import { RiFileCloudLine } from "react-icons/ri";
import { LuMessagesSquare } from "react-icons/lu";
import { MdOutlineCalendarToday } from "react-icons/md";

// 定义导航项接口
export interface NavItem {
	name: string;
	href: string;
	icon: React.ReactNode;
}

export const NavigationList: NavItem[] = [
	{
		name: "云文档",
		href: "/home/cloud-docs",
		icon: <RiFileCloudLine size={24} />,
	},
	{
		name: "消息",
		href: "/home/messages",
		icon: <LuMessagesSquare size={24} />,
	},
	{
		name: "日历",
		href: "/home/calendar",
		icon: <MdOutlineCalendarToday size={24} />,
	},
];
