// src/config/validation.schema.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // 只校验当前需要的环境变量，简单直接
  PORT: Joi.number().integer().min(1).max(65535).default(3000), // 默认3000，避免没配置时报错
  DATABASE_URL: Joi.string().required().uri().description('数据库连接地址（必填）'),
  GITHUB_CLIENT_ID: Joi.string().required().description('GitHub OAuth App Client ID'),
  GITHUB_CLIENT_SECRET: Joi.string().required().description('GitHub OAuth App Client Secret'),
  GITHUB_REDIRECT_URI: Joi.string().required().description('GitHub OAuth 回调地址'),
  JWT_SECRET: Joi.string().required().min(32).description('JWT 签名密钥（至少32字符）'),
  JWT_EXPIRES_IN: Joi.string().default('7d').description('JWT 过期时间，如 7d, 24h, 3600（秒）'),
  FRONTEND_URL: Joi.string().required().uri().description('前端地址（用于回调重定向）'),
});