"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "认证服务配置错误，请联系管理员",
  AccessDenied: "您取消了 GitHub 登录授权",
  Default: "登录失败，请重试",
  OAuthSignin: "无法连接到 GitHub，请检查网络",
  OAuthCallback: "GitHub 回调失败，请重试",
  OAuthCreateAccount: "创建账户时出错",
  EmailCreateAccount: "创建邮箱账户时出错",
  CallbackRouteError: "回调路由错误",
  OAuthAccountNotLinked: "此 GitHub 账号已关联其他登录方式，请使用相同方式登录",
  EmailSignin: "邮箱登录链接发送失败",
  CredentialsSignin: "凭据无效，请检查用户名或密码",
  SessionRequired: "需要登录会话",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/home/cloud-docs";
  const error = searchParams.get("error");

  const handleSignIn = () => {
    signIn("github", { callbackUrl });
  };

  return (
    <div className="font-sans">
      {/* 关键：用 flex 让正方形居中，去掉 min-h-screen，避免高度拉伸 */}
      <div className="flex justify-center items-center min-h-screen  bg-white p-4">
        {/* 正方形外层容器：宽高完全相等，强制正方形 */}
        <div className="relative w-[360px] h-[360px] sm:w-[400px] sm:h-[400px]">
          {/* 装饰性背景卡片 - 跟外层容器一致，也是正方形 */}
          <div className="card bg-blue-400 shadow-lg w-full h-full rounded-3xl absolute transform -rotate-6"></div>
          <div className="card bg-red-400 shadow-lg w-full h-full rounded-3xl absolute transform rotate-6"></div>

          {/* 主内容区：白色正方形，填充外层容器 */}
          <div className="relative w-full h-full rounded-3xl px-6 py-6 bg-white shadow-md flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-3">
              欢迎使用 DocVault
            </h3>
            <p className="text-sm text-gray-600 text-center mb-5">
              请使用 GitHub 账号登录
            </p>

            {/* 错误提示区域 */}
            {error && (
              <div
                className="mb-5 p-2 border-l-4 border-red-500 bg-red-50 text-red-700 text-sm rounded"
                role="alert"
              >
                <strong className="font-medium">登录失败</strong>
                <p className="mt-1">
                  {ERROR_MESSAGES[error] || ERROR_MESSAGES.Default}
                </p>
              </div>
            )}

            {/* 登录表单 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
              className="space-y-5"
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-3 rounded-xl shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all duration-200 transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.09-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                使用 GitHub 登录
              </button>
            </form>

            {/* 底部提示 */}
            <p className="text-xs text-gray-500 text-center mt-6">
              登录即表示你同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
