"use client";
import LoginPage from "@/app/components/login";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const [initialHistoryLen, setInitialHistoryLen] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (pathname === "/home/login" && initialHistoryLen === null) {
      const timer = setTimeout(() => {
        setInitialHistoryLen(history.length);
      }, 100);
      return () => clearTimeout(timer);
    }

    if (pathname === "/home/login" && initialHistoryLen !== null) {
      const isPageRefresh = history.length < initialHistoryLen - 1;

      if (isPageRefresh) {
        redirect("/login");
      }
    }
  }, [pathname, initialHistoryLen, router]);
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
