"use client";
"use client";
import { use, type ReactNode } from "react";
import SearchBar from "../components/SearchBar";
import Image from "next/image";
import Link from "next/link";
import { NavigationList } from "../components/navigation";
import { usePathname } from "next/navigation";
import AuthProvider from "../components/AuthProvider";
import { useAuth } from "../components/AuthProvider";
export default function HomeLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div
        className="
      static inset-y-0 left-0 w-64 bg-white shadow-sm 
      border-r border-gray-200 flex flex-col
    "
      >
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
              // 精确匹配或为当前路径的子路径
              const isActive =
                pathname === item.href || // 完全匹配当前路径
                pathname.startsWith(`${item.href}/`); // 匹配当前路径的子路径
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
          group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200 ease-in-out
          ${
            isActive
              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }
        `}
                  >
                    <span
                      className={`
            mr-3 transition-colors duration-200
            ${
              isActive
                ? "text-blue-700"
                : "text-gray-500 group-hover:text-gray-700"
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
      <div className="flex-1 flex flex-col overflow-hidden ">
        <div
          className="flex items-center px-4 transition-all duration-300  justify-between"
          style={{
            height: "10%",
            backgroundColor: "rgb(251, 252, 246)",
            borderBottom: "0.5px solid rgb(200, 204, 208)",
          }}
        >
          <SearchBar />
          {/* 新增头像框 + login链接 */}
          <div className="flex items-center gap-4">
            {/* 头像框 */}
            <div
              className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300"
              style={{ position: "relative" }}
            >
              {/* 这里使用默认头像，实际项目中可替换为用户头像 */}
              <Image
                src={user?.avatar || "/images/default-avatar.png"} // 建议在public/images下放置默认头像图片
                alt="User Avatar"
                fill
                style={{ objectFit: "cover" }}
              />
              {!user ? (
                <Link href="/home/login">login</Link>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{user.name}</span>
                  <button onClick={logout}>logout</button>
                </div>
              )}
            </div>
            <Link href="/home/login">login</Link>
          </div>
        </div>
        <main className="flex-1 flex overflow-y-auto">
          <AuthProvider>
            {children}
            {modal}
          </AuthProvider>
        </main>
        {/*  */}
      </div>
    </div>
  );
}
