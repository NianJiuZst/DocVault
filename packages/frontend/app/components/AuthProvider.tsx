"use client";

import {
  useEffect,
  useState,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// 1. 定义用户类型（与后端返回字段匹配）
interface User {
  id: number;
  name: string;
  avatar?: string;
  email?: string | null;
  githubUserId: string;
  createdAt?: string;
  updatedAt?: string;
}

// 2. 定义认证上下文类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

// 3. 创建 Context 并设置默认值
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  logout: async () => {},
});

// 4. 自定义 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth 必须在 AuthProvider 组件内部使用");
  }
  return context;
};

// 5. 核心认证提供者组件
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  // 定义常量存储登录页路径（避免重复书写，确保依赖稳定）
  const LOGIN_PATH = "/home/login";

  // 6. 登录状态检查与自动跳转（修复依赖数组问题）
  useEffect(() => {
    const checkLogin = async () => {
      setError(null);
      try {
        const res = await fetch("http://localhost:3001/users/me", {
          method: "POST",
          credentials: "include", // 确保跨域 Cookie 传递
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          // 已登录状态下若在登录页，自动跳转到首页
          if (pathname === LOGIN_PATH) {
            router.push("/");
          }
        } else {
          setUser(null);
          // 未登录且不在登录页时跳转
          if (pathname !== LOGIN_PATH) {
            router.push(LOGIN_PATH);
          }
          if (res.status !== 401) {
            setError("用户状态异常，请重新登录");
          }
        }
      } catch (err) {
        console.error("登录状态检查失败:", err);
        setUser(null);
        setError("网络连接异常，请检查网络后重试");
        if (pathname !== LOGIN_PATH) {
          router.push(LOGIN_PATH);
        }
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, [router, pathname, LOGIN_PATH]); // 依赖数组元素固定，顺序稳定

  // 7. 登出方法
  const logout = async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:3001/auth/logout", {
        method: "POST",
        credentials: "include", // 保持跨域一致性
      });
      if (res.ok) {
        setUser(null);
        router.push(LOGIN_PATH);
      } else {
        setError("登出失败，请稍后重试");
      }
    } catch (err) {
      console.error("登出请求失败:", err);
      setError("网络错误，登出操作未完成");
    }
  };

  // 8. 加载中状态
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

  // 9. 提供上下文
  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
