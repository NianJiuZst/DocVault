import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    NEXT_PUBLIC_AUTH_CALLBACK_URL: process.env.AUTH_CALLBACK_URL,
  },
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  experimental: {
    // 保持原有实验性配置（如果有）
  },
};

export default nextConfig;
