// app/api/auth/github/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

// 从环境变量读取
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const CALLBACK_URL = process.env.AUTH_CALLBACK_URL!;

// 简单的会话存储（生产环境应使用 Redis 或数据库）
const sessions = new Map<string, any>();

// 验证 state（防止 CSRF）
function validateState(state: string | null): boolean {
  if (!state) return false;
  const savedState = localStorage.getItem("oauth_state"); // 实际应使用 cookie 或 server session
  return state === savedState;
}

// 生成会话 ID
function generateSessionId() {
  return createHash("sha256").update(Math.random().toString()).digest("hex");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const callbackUrl = searchParams.get("callbackUrl") || "/home/cloud-docs";

  // 1. 验证 state
  if (!validateState(state)) {
    return NextResponse.redirect(
      `/login?error=CallbackRouteError&callbackUrl=${encodeURIComponent(
        callbackUrl
      )}`
    );
  }

  // 2. 用 code 换 access_token ✅ 第三步
  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: CALLBACK_URL,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    if (!access_token) {
      throw new Error(
        "Failed to get access token: " + JSON.stringify(tokenData)
      );
    }

    // 3. 用 access_token 获取用户信息 ✅ 第四步
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const userData = await userResponse.json();

    if (!userData.id) {
      throw new Error("Failed to get user data");
    }

    // 4. 创建会话
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      userId: userData.id,
      username: userData.login,
      avatar: userData.avatar_url,
      email: userData.email,
    });

    // 5. 设置会话 Cookie 并重定向
    const response = NextResponse.redirect(callbackUrl);
    response.cookies.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 小时
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    return NextResponse.redirect(
      `/login?error=OAuthCallback&callbackUrl=${encodeURIComponent(
        callbackUrl
      )}`
    );
  }
}
