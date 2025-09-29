import type { Metadata } from 'next';
import { ReactNode } from 'react';
import SidebarItem from '../components/SidebarItem';
import SearchBar from '../components/SearchBar';

export const metadata: Metadata = {
  title: 'DocVault',
  description: '一个优雅宁静的文档协作空间',
};

export default function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen flex font-sans antialiased">
      {/* 左侧栏 - 16.67% */}
      <div
        className="flex flex-col relative"
        style={{
          width: '16.67%',
          backgroundColor: 'rgb(219, 223, 226)',
        }}
      >
        {/* 左右分隔线 */}
        <div
          className="absolute right-0 top-0 w-[0.5px] h-full"
          style={{ backgroundColor: 'rgb(190, 194, 198)' }}
        ></div>

        {/* Logo 区域 */}
        <div
          className="flex items-center px-4 transition-all duration-300"
          style={{
            height: '15.4%',
            backgroundColor: 'rgb(246, 246, 245)',
            borderBottom: '0.5px solid rgb(200, 204, 208)',
          }}
        >
          <div
            className="flex items-center justify-center transition-transform duration-200 hover:scale-105"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgb(255, 255, 255)',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
              flexShrink: 0,
            }}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          <span
            className="ml-3 font-semibold tracking-tight whitespace-nowrap"
            style={{
              fontSize: '22px',
              color: 'rgb(96, 92, 88)',
              lineHeight: '1',
            }}
          >
            DocVault
          </span>
        </div>

        {/* 菜单列表 */}
        <div className="flex flex-col p-4 space-y-2" style={{ height: '84.6%' }}>
          {['云文档', '消息', '日历'].map((item, index) => (
            <SidebarItem key={item} iconSrc="/images/logo.png" label={item} />
          ))}
        </div>
      </div>

      {/* 右侧容器 */}
      <div className="w-5/6 flex flex-col">
        {/* 搜索栏 */}
        <div
          className="flex items-center px-8 transition-all duration-300"
          style={{
            height: '15.4%',
            backgroundColor: 'rgb(251, 252, 246)',
            borderBottom: '0.5px solid rgb(200, 204, 208)',
          }}
        >
          <SearchBar />
        </div>

        {/* 主内容区 —— 由 page.tsx 提供 */}
        <div style={{ height: '84.6%', position: 'relative' }}>
          {children}
        </div>
      </div>
    </div>
  );
}