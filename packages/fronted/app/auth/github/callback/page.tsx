"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GithubCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleGitHubCallback = async () => {
      // 从URL参数中获取GitHub返回的code
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      // 如果GitHub返回错误，直接跳转登录页
      if (error) {
        router.push(`/home/login?error=授权失败: ${error}`);
        return;
      }

      // 缺少code参数
      if (!code) {
        router.push("/home/login?error=缺少授权码");
        return;
      }

      try {
        // 调用后端接口交换Token
        const res = await fetch(
          `http://localhost:3001/auth/github/callback?code=${code}`,
          {
            method: "GET",
            credentials: "include", // 允许跨域传递Cookie
          }
        );

        if (!res.ok) {
          const errorMsg = await res.text().catch(() => "未知错误");
          throw new Error(`后端处理失败: ${errorMsg}`);
        }

        // 解析后端返回的Token和用户信息
        const { jwtToken, user } = await res.json();
        if (!jwtToken || !user) {
          throw new Error("后端未返回有效认证信息");
        }

        // 存储Token（与AuthProvider中保持一致）
        localStorage.setItem("jwtToken", jwtToken);
        // 跳转首页
        router.push("/");
      } catch (err) {
        console.error("GitHub登录回调处理失败:", err);
        const errorMsg = err instanceof Error ? err.message : "登录过程出错";
        router.push(`/home/login?error=${encodeURIComponent(errorMsg)}`);
      }
    };

    handleGitHubCallback();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p>正在处理登录，请稍候...</p>
    </div>
  );
}
