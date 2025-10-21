"use client";

import { useSearchParams } from "next/navigation";
import LoginForm, { ERROR_MESSAGES } from "../components/login";

// 新增：客户端设置 Cookie 的工具函数
const setClientCookie = (
  name: string,
  value: string,
  maxAgeSeconds: number
) => {
  document.cookie = `${name}=${value}; max-age=${maxAgeSeconds}; path=/; sameSite=lax; ${
    process.env.NODE_ENV === "production" ? "secure;" : ""
  }`;
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home/cloud-docs";
  const error = searchParams.get("error") || undefined;
  const errorMessage = ERROR_MESSAGES[error || ""] || ERROR_MESSAGES.Default;

  const handleSignIn = () => {
    const clientId =
      process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "Ov23liLnXI5JngJR7Ykx";
    const redirectUri =
      process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL ||
      "http://localhost:3001/auth/github/callback";
    const state = Math.random().toString(36).substring(2);

    // 关键修改：用 Cookie 存 state，替换 localStorage
    setClientCookie("github_oauth_state", state, 600); // 600秒=10分钟有效期，与回调路由一致

    // 拼接 GitHub 授权 URL（逻辑不变）临时修改
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=Ov23liLnXI5JngJR7Ykx&` +
      `redirect_uri=http://localhost:3001/auth/github/callback&` +
      `scope=user&` +
      `state=${state}`;

    window.location.href = githubAuthUrl;
  };

  return (
    <LoginForm
      callbackUrl={callbackUrl}
      error={error}
      errorMessage={errorMessage}
      onSignIn={handleSignIn}
    />
  );
}
