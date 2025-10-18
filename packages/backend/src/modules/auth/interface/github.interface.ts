export interface GithubAccessTokenResponse {
  // -------------------------- 成功响应字段（必选） --------------------------
  /** 访问令牌（核心字段，用于后续请求 GitHub API） */
  access_token: string;
  /** 令牌类型（固定为 "bearer"） */
  token_type: "bearer";
  /** 授权范围（如 "user:email,repo"，多个范围用逗号分隔；无特定范围则为 ""） */
  scope: string;
  // -------------------------- 错误响应字段（仅失败时返回） --------------------------
  /** 错误代码（如 "incorrect_code"、"redirect_uri_mismatch" 等） */
  error?: string;
  /** 错误描述 */
  error_description?: string;
  /** 错误详情文档的 URL（可选） */
  error_uri?: string;
}


export interface GithubUserResponse {
  // -------------------------- 核心身份信息（必选） --------------------------
  /** GitHub 唯一用户 ID（数字），如 123456 */
  id: number;
  /** GitHub 用户名（登录名），如 "octocat"，全局唯一 */
  login: string;
  /** 用户头像 URL（HTTPS），如 "https://avatars.githubusercontent.com/u/583231?v=4" */
  avatar_url: string;
  /** 用户 GitHub 个人主页 URL，如 "https://github.com/octocat" */
  html_url: string;
  /** 用户账号创建时间（ISO 8601 字符串），如 "2011-01-25T18:44:36Z" */
  created_at: string;
  /** 用户信息最后更新时间（ISO 8601 字符串），如 "2024-05-20T10:30:00Z" */
  updated_at: string;
  // -------------------------- 可选公开信息（可能为 null） --------------------------
  /** 用户名（真实姓名，如 "The Octocat"），用户未设置则为 null */
  name: string | null;
  /** 用户邮箱（需用户在 GitHub 公开，或后端有 user:email 权限），未公开则为 null */
  email: string | null;
  /** 用户个人简介（如 "A passionate developer"），未设置则为 null */
  bio: string | null;
  /** 所在公司（如 "GitHub"），未设置则为 null */
  company: string | null;
  /** 所在地区（如 "San Francisco, CA"），未设置则为 null */
  location: string | null;
  /** 个人博客/网站 URL（如 "https://octocat.github.io"），未设置则为 null */
  blog: string | null;
  // -------------------------- 账号统计信息（必选） --------------------------
  /** 公开仓库数量（如 10） */
  public_repos: number;
  /** 公开 Gist 数量（如 5） */
  public_gists: number;
  /** 粉丝数量（如 100） */
  followers: number;
  /** 关注的用户数量（如 50） */
  following: number;

  // -------------------------- 其他可选字段（按需保留） --------------------------
  /** 是否启用双因素认证（2FA），布尔值 */
  two_factor_authentication?: boolean;
  /** 用户类型（固定为 "User"，区分组织 "Organization"） */
  type?: "User" | "Organization";
  /** 是否为 GitHub 员工（如 false） */
  site_admin?: boolean;
  /** 最后一次推送代码的时间（ISO 8601 字符串），未推送过则为 null */
  pushed_at?: string | null;
}