"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function GithubCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleGitHubCallback = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        router.replace(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!code) {
        router.replace("/login?error=CallbackRouteError");
        return;
      }

      const callbackUrl = new URL(`${BACKEND_URL}/auth/github/callback`);
      callbackUrl.searchParams.set("code", code);
      if (state) {
        callbackUrl.searchParams.set("state", state);
      }

      window.location.href = callbackUrl.toString();
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
