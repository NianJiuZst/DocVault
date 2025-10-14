// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 将环境变量暴露给前端（以 NEXT_PUBLIC_ 开头的变量会自动暴露）
  // 但为了清晰，也可以显式定义 env
  env: {
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    NEXT_PUBLIC_AUTH_CALLBACK_URL: process.env.AUTH_CALLBACK_URL,
  },

  // 可选：如果你使用 App Router 和 Server Components，可以配置 experimental 选项
  // 但通常不需要特别配置
  experimental: {
    // 例如启用 server actions（如果你要用）
    // serverActions: true,
  },
};

export default nextConfig;
