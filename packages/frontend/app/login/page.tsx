"use client";

import { useSearchParams } from "next/navigation";
import LoginForm, { ERROR_MESSAGES } from "../components/login";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
    const redirectUri = `${BACKEND_URL}/auth/github/callback`;
    const state = Math.random().toString(36).substring(2);

    setClientCookie("github_oauth_state", state, 600);

    const githubAuthUrl =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=user&` +
      `state=${encodeURIComponent(state)}`;

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
