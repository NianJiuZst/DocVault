"use client";
import { type ReactNode } from "react";
import SearchBar from "../../components/SearchBar";
import Image from "next/image";
import Link from "next/link";
import { NavigationList } from "../../components/Navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import avatarsrc from "@/src/image/deavatar.jpg";
import { ThemeProvider, useTheme } from "@/src/theme/ThemeProvider";
import { FiSun } from "react-icons/fi";
import { BsMoon } from "react-icons/bs";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <BsMoon className="text-gray-600 w-5 h-5" />
      ) : (
        <FiSun className="text-yellow-400 w-5 h-5" />
      )}
    </button>
  );
}

export default function HomeLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-white dark:bg-slate-900 transition-colors">
        {/* 侧边栏 */}
        <div className="static inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-sm border-r border-gray-200 dark:border-slate-700 flex flex-col">
          {/* Logo 区域 */}
          <div
            className="flex items-center px-4 transition-all duration-300"
            style={{
              height: "10%",
              backgroundColor: "rgb(246, 246, 245)",
              borderBottom: "0.5px solid rgb(200, 204, 208)",
              minHeight: "80px",
            }}
          >
            <div
              className="flex items-center justify-center transition-transform duration-200 hover:scale-105"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgb(255, 255, 255)",
                overflow: "hidden",
                boxShadow: "0 2px 5px rgba(0,0,0,0.04)",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <Image
                src="/images/logo.png"
                alt="Logo"
                fill
                style={{ objectFit: "cover" }}
                priority={true}
              />
            </div>

            <span
              className="ml-3 font-semibold tracking-tight whitespace-nowrap"
              style={{
                fontSize: "22px",
                color: "rgb(96, 92, 88)",
                lineHeight: "1",
              }}
            >
              DocVault
            </span>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {NavigationList.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 ease-in-out
                        ${isActive
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                        }
                      `}
                    >
                      <span
                        className={`
                          mr-3 transition-colors duration-200
                          ${isActive
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                          }
                        `}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部栏 */}
          <div
            className="flex items-center px-4 transition-all duration-300 justify-between"
            style={{
              height: "10%",
              backgroundColor: "rgb(251, 252, 246)",
              borderBottom: "0.5px solid rgb(200, 204, 208)",
            }}
          >
            <SearchBar />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {/* 头像框 */}
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 relative">
                <Image
                  src={user?.avatar || avatarsrc}
                  alt="User Avatar"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              {/* 用户信息和登出/登录按钮 */}
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <span className="text-gray-700 dark:text-gray-200">{user.name}</span>
                    <button
                      onClick={logout}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-gray-400 rounded-2xl shadow-md hover:bg-gray-700 transition-all duration-200 hover:shadow-lg"
                    >
                      logout
                    </button>
                  </>
                ) : (
                  <Link href="/home/login" className="text-blue-600 underline">
                    login
                  </Link>
                )}
              </div>
            </div>
          </div>

          <main className="flex-1 flex overflow-y-auto bg-white dark:bg-slate-900">
            {children}
            {modal}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
