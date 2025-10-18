"use client";

import { useSearchParams } from "next/navigation";
// 关键：从 app/components/login.tsx 导入组件（相对路径）
import LoginForm, { ERROR_MESSAGES } from "../components/login";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home/cloud-docs";
  const error = searchParams.get("error") || undefined; // 转换null为undefined
  const errorMessage = ERROR_MESSAGES[error || ""] || ERROR_MESSAGES.Default;

  // 定义登录逻辑函数
  const handleSignIn = () => {
    const clientId =
      process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "Ov23liLnXI5JngJR7Ykx";
    const redirectUri =
      process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL ||
      "http://localhost:3001/api/auth/github/callback";
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem("oauth_state", state);

    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=user&` +
      `state=${state}`;

    window.location.href = githubAuthUrl;
  };

  // 传递props给组件
  return (
    <LoginForm
      callbackUrl={callbackUrl}
      error={error}
      errorMessage={errorMessage}
      onSignIn={handleSignIn} // 正确传递函数
    />
  );
}
