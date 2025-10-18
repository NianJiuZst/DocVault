// components/AuthProvider.tsx
"use client";

import {
  useEffect,
  useState,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// 1. 定义用户类型（与模板一致，确保后端返回字段匹配）
interface User {
  id: number;
  name: string;
  avatar?: string;
  email?: string | null;
  githubUserId: string;
  createdAt?: string; // 后端 Date 类型序列化后的字符串
  updatedAt?: string;
}

// 2. 定义认证上下文类型（包含所有需要全局共享的状态和方法）
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>; // 异步登出方法
}

// 3. 创建 Context 并设置默认值（类型严格对齐，避免初始化报错）
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {}, // 默认空实现，实际会被 Provider 覆盖
});

// 4. 自定义 Hook：简化子组件获取上下文的方式，增加使用校验
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth 必须在 AuthProvider 组件内部使用");
  }
  return context;
};

// 5. 核心认证提供者组件（重点优化跳转逻辑）
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // 获取当前页面路径，用于避免无限跳转

  // 6. 登录状态检查与自动跳转（核心逻辑优化）
  useEffect(() => {
    const checkLogin = async () => {
      // 初始化时重置错误状态，避免残留旧错误
      setError(null);
      try {
        // 调用后端接口获取当前用户信息（判断是否登录）
        const res = await fetch("/api/user/me");

        if (res.ok) {
          // 接口成功：说明已登录，保存用户信息
          const data = await res.json();
          setUser(data.user);
        } else {
          // 接口失败：无论状态码是 401（未授权）还是其他，均视为“未登录/需重新登录”
          setUser(null);
          // 关键跳转判断：当前不在登录页时，才跳转到登录页（避免无限循环）
          if (pathname !== "/home/login") {
            // 使用 Next.js 路由的 push 方法跳转，保留浏览器历史记录
            router.push("/home/login");
          }
          // 针对非 401 错误（如 500 服务器错误），补充错误提示
          if (res.status !== 401) {
            setError("用户状态异常，请重新登录");
          }
        }
      } catch (err) {
        // 捕获网络错误（如断网、接口不存在）
        console.error("登录状态检查失败:", err);
        setUser(null); // 网络错误时，默认视为未登录
        setError("网络连接异常，请检查网络后重试");
        // 网络错误时仍触发跳转（兜底处理，确保未登录状态下进入登录页）
        if (pathname !== "/home/login") {
          router.push("/home/login");
        }
      } finally {
        // 无论成功/失败，最终都结束加载状态（避免一直显示“加载中”）
        setLoading(false);
      }
    };

    // 立即执行登录检查
    checkLogin();
  }, [router, pathname]); // 依赖路由实例和当前路径，确保路径变化时重新校验

  // 7. 登出方法实现（与模板逻辑一致，确保登出后跳转登录页）
  const logout = async () => {
    try {
      setError(null);
      // 调用后端登出接口（清除服务端会话）
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        // 登出成功：清除前端用户状态 + 跳转到登录页
        setUser(null);
        router.push("/home/login");
      } else {
        // 登出接口失败（如服务端错误）
        setError("登出失败，请稍后重试");
      }
    } catch (err) {
      // 捕获登出过程中的网络错误
      console.error("登出请求失败:", err);
      setError("网络错误，登出操作未完成");
    }
  };

  // 8. 加载中状态：全局统一显示加载提示（可自定义样式）
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        加载中...
      </div>
    );
  }

  // 9. 提供上下文给所有子组件，确保全局可访问
  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
