// src/auth.ts（v4 正确配置）
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

// v4 中直接导出配置函数，没有单独的 `auth` 成员
export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
});
