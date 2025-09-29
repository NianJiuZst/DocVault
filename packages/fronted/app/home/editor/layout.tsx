import { ReactNode } from 'react';

export default function EditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 不添加任何额外布局，直接渲染 children
  // 这样就会自动使用父级 home/layout.tsx 的布局
  return <>{children}</>;
}