"use client";
// 注意：这里导入的组件名建议和功能对齐，原组件是UI组件，可改名为LoginForm（非必需，仅为清晰）
import LoginForm, { ERROR_MESSAGES } from "@/app/components/login";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // 新增：获取URL参数（如error、callbackUrl）
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // 1. 处理URL参数（和login/page.tsx逻辑一致）
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // 默认回调地址设为首页（可调整）
  const error = searchParams.get("error") || undefined;
  // const ERROR_MESSAGES: Record<string, string> = {
  //   Configuration: "认证服务配置错误，请联系管理员",
  //   AccessDenied: "您取消了 GitHub 登录授权",
  //   Default: "登录失败，请重试",
  //   OAuthSignin: "无法连接到 GitHub，请检查网络",
  //   OAuthCallback: "GitHub 回调失败，请重试",
  //   OAuthCreateAccount: "创建账户时出错",
  //   EmailCreateAccount: "创建邮箱账户时出错",
  //   CallbackRouteError: "回调路由错误",
  //   OAuthAccountNotLinked:
  //     "此 GitHub 账号已关联其他登录方式，请使用相同方式登录",
  //   EmailSignin: "邮箱登录链接发送失败",
  //   CredentialsSignin: "凭据无效，请检查用户名或密码",
  //   SessionRequired: "需要登录会话",
  // };
  const errorMessage = ERROR_MESSAGES[error || ""] || ERROR_MESSAGES.Default;

  // 2. 定义登录逻辑（和login/page.tsx逻辑一致）
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
      `state=${state}&` +
      `callbackUrl=${encodeURIComponent(callbackUrl)}`; // 携带回调地址

    window.location.href = githubAuthUrl;
  };

  // 3. 保留原有的首次加载判断逻辑
  useEffect(() => {
    if (isFirstLoad) {
      console.log(2);
      setIsFirstLoad(false);
    } else {
      console.log(1);
    }
  }, [pathname]);

  // 4. 给LoginForm传递所有必需的props
  return (
    <div
      className="flex justify-center items-center fixed inset-0 bg-gray-500/[.8] "
      onClick={router.back}
    >
      <div className="" onClick={(e) => e.stopPropagation()}>
        <LoginForm
          callbackUrl={callbackUrl}
          error={error}
          errorMessage={errorMessage}
          onSignIn={handleSignIn} // 关键：传递登录函数
        />
      </div>
    </div>
  );
}
