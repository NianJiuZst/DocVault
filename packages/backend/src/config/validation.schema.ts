// src/config/validation.schema.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // 只校验当前需要的环境变量，简单直接
  PORT: Joi.number().integer().min(1).max(65535).default(3000), // 默认3000，避免没配置时报错
  DATABASE_URL: Joi.string().required().uri().description('数据库连接地址（必填）'),
});