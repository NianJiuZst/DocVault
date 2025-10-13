"use client";
import LoginPage from "@/app/components/login";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (isFirstLoad) {
      // 首次加载 → 硬导航（如刷新、地址栏输入、首次打开）
      console.log(2);
      setIsFirstLoad(false); // 仅首次加载后设为 false
    } else {
      // 非首次加载但路径变化 → 软导航（如 Link 跳转、router.push）
      console.log(1);
    }
  }, [pathname]); // 依赖 pathname，路径变化时触发
  return (
    <div
      className="flex justify-center items-center fixed inset-0 bg-gray-500/[.8] "
      onClick={router.back}
    >
      <div className="" onClick={(e) => e.stopPropagation()}>
        <LoginPage />
      </div>
    </div>
  );
}
