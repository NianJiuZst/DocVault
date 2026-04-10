# DocVault 开发计划

> 协作文档编辑器 · 基于 Tiptap + Next.js 15 + NestJS 11

---

## 📊 项目现状

### 已完成功能

| 分类 | 功能 | 状态 |
|------|------|------|
| **认证** | GitHub OAuth 登录 | ✅ |
| **文档编辑** | 富文本编辑（标题/列表/代码块/引用/图片/链接） | ✅ |
| **文档管理** | CRUD + 版本历史 + 回滚 | ✅ |
| **文档分享** | 用户级分享（viewer/editor）+ 公开链接 | ✅ |
| **实时协作** | Yjs + Hocuspocus WebSocket 协同编辑 | ✅ |
| **主题** | Dark/Light Mode 切换 | ✅ |
| **搜索** | 文档标题全文搜索 | ✅ |
| **导入/导出** | Markdown 导入/导出（PDF 导出后端已实现） | ✅ |
| **模板系统** | 后端 CRUD，前端 UI 已搭建 | ✅ |
| **分页** | 文档列表分页（page/pageSize） | ✅ |
| **测试** | 单元测试 + E2E | ✅ |
| **CI/CD** | GitHub Actions 自动测试 | ✅ |

### 部分完成 / 需完善

| 分类 | 功能 | 状态 | 说明 |
|------|------|------|------|
| **模板** | 前端模板选择器 | ⚠️ | UI 已搭建，需连接真实 API |
| **分享** | 分享管理页面 | ⚠️ | UI 已搭建，数据可能为 mock |

###  Stub 占位页面（未连接后端）

| 页面 | 状态 | 说明 |
|------|------|------|
| **消息/通知** | ❌ 空页面 | 需要全新实现通知系统 |
| **日历** | ❌ 空页面 | 需要全新实现 |
| **知识库** | ⚠️ Mock 数据 | 需连接真实后端 API |
| **笔记** | ⚠️ Mock 数据 | 需连接真实后端 API |

---

## 🔴 高优先级

### 1. 通知系统（通知中心）
**说明：** 当前完全缺失，用户无法收到分享、评论、@提及 等事件通知

**后端任务：**
- [ ] `Notification` 数据模型（id, userId, type, content, read, createdAt, link?）
- [ ] `GET /notifications` 获取通知列表（分页）
- [ ] `PATCH /notifications/:id/read` 标记单条已读
- [ ] `POST /notifications/mark-all-read` 全部已读
- [ ] WebSocket 实时推送通知（复用现有 collaboration WS 通道）
- [ ] 触发通知的事件点：文档被分享、文档被评论、@被提及
- [ ] 通知单元测试

**前端任务：**
- [ ] 通知下拉面板（导航栏铃铛图标）
- [ ] 未读通知红点 Badge
- [ ] 通知列表页面（支持分页）
- [ ] 通知声音提示（可选）

---

### 2. 评论与批注系统
**说明：** 文档内评论、@提及、批注功能，Notion-style

**后端任务：**
- [ ] `Comment` 数据模型（id, documentId, userId, content, parentId, position?, createdAt）
- [ ] `POST /documents/:id/comments` 添加评论
- [ ] `GET /documents/:id/comments` 获取评论列表
- [ ] `DELETE /comments/:id` 删除评论
- [ ] `@username` 解析与通知触发
- [ ] WebSocket 实时推送新评论
- [ ] 评论单元测试

**前端任务：**
- [ ] 文档右侧评论面板
- [ ] 选中文本创建批注（highlight + 弹出评论框）
- [ ] @提及自动补全
- [ ] 评论通知 Badge
- [ ] 评论富文本（支持 @链接、代码片段）

---

### 3. 用户画像与设置
**说明：** 当前用户信息只读，无法修改头像、昵称、密码

**后端任务：**
- [ ] `User` 表已有 `avatar`, `name` 字段（`bio` 缺失）
- [ ] `PATCH /users/me` 更新个人资料（name, bio, avatar URL）
- [ ] `PATCH /users/me/password` 修改密码
- [ ] 头像上传接口（支持 CDN 或 base64）
- [ ] 用户设置单元测试

**前端任务：**
- [ ] 用户设置页面（头像上传、昵称、简介、密码修改）
- [ ] 设置页面入口（个人中心）

---

## 🟡 中优先级

### 4. 文档模板市场
**说明：** 后端已完整实现，前端模板选择器需连接真实 API

**前端任务：**
- [ ] 模板选择器连接 `/templates` API（当前为 mock）
- [ ] 模板预览功能
- [ ] 「从模板创建」完整流程

**后端补充：**
- [ ] 预设系统模板（周报、会议纪要、PRD、复盘）

---

### 5. 搜索增强
**说明：** 当前只支持标题搜索，内容全文搜索缺失

**后端任务：**
- [ ] 文档内容全文搜索（PostgreSQL full-text search 或集成 Meilisearch）
- [ ] 搜索结果高亮
- [ ] 搜索过滤器（按类型、按时间、按分享状态）

**前端任务：**
- [ ] 搜索结果页（支持高亮、分页）
- [ ] 搜索历史记录
- [ ] 高级搜索面板

---

### 6. 分享管理页面
**说明：** 前端 UI 已搭建，需连接后端真实数据

**前端任务：**
- [ ] 连接 `/documents/:id/shares` API
- [ ] 显示当前文档所有分享用户及权限
- [ ] 快速修改/撤销分享权限
- [ ] 公开链接管理（生成、禁用、复制链接）

---

### 7. 日历页面
**说明：** 当前为空占位页面

**前端任务：**
- [ ] 日历视图（月视图）
- [ ] 文档按时间归档显示
- [ ] 快速创建日程文档

**后端任务：**
- [ ] `GET /documents?sort=updatedAt&group=month` 按月分组接口（可选）

---

### 8. 消息/通知列表页面
**说明：** 当前为空白页面

**前端任务：**
- [ ] 通知列表全页面（历史通知）
- [ ] 按类型筛选（分享、评论、@、系统）
- [ ] 通知偏好设置

---

## 🟢 低优先级 / 长期

### 9. Markdown 导出 PDF（前端）
**说明：** 后端已实现 `exportAsPdf`，前端导出按钮缺失

**前端任务：**
- [ ] 编辑器工具栏添加「导出」下拉（Markdown / PDF）
- [ ] 导出进度提示
- [ ] PDF 预览（可选）

---

### 10. 离线支持 (PWA)
**说明：** 当前无离线能力

**后端任务：**
- [ ] Service Worker 缓存策略

**前端任务：**
- [ ] PWA manifest 配置
- [ ] 离线状态检测 + 本地草稿缓存
- [ ] 在线状态恢复提示

---

### 11. 移动端优化
**说明：** 当前未做响应式

**前端任务：**
- [ ] 响应式布局适配
- [ ] 移动端编辑器工具栏简化
- [ ] 触摸手势支持

---

### 12. 图表扩展
**说明：** Tiptap 支持图表插件

**前端任务：**
- [ ] 集成 Tiptap Mermaid 扩展
- [ ] 集成图表插件（如 Chart.js）

---

## 🛠️ 技术债务

| 类型 | 问题 | 解决方案 | 优先级 |
|------|------|----------|--------|
| **安全** | 缺少速率限制（Rate Limiting） | NestJS @nestjs/throttler | 🔴 高 |
| **安全** | 导出接口权限校验 | 检查 owner/shared 逻辑是否完整 | 🔴 高 |
| **Bug** | `FolderTree.tsx` 硬编码 `localhost:3001` | 已修复 ✅ | ✅ |
| **性能** | Yjs 大文档协同可能卡顿 | 分片优化 + 懒加载历史版本 | 🟡 中 |
| **可维护性** | 后端模块间耦合较重 | 逐步抽离 shared 模块 | 🟡 中 |
| **可维护性** | 前后端类型未共享 | 考虑 tRPC 或共享 schema | 🟢 低 |
| **可维护性** | `.env.example` 缺少部分变量文档 | 补充所有环境变量说明 | 🟢 低 |

---

## 📝 Commit 规范

```
feat(comment): add comment data model and CRUD endpoints
feat(comment): add WebSocket real-time comment push
feat(comment): build comment panel UI in editor
feat(comment): add @mention autocomplete
fix(search): use PostgreSQL full-text search instead of title-only
test(comment): add unit tests for comment service
refactor(auth): extract shared JWT logic into guard
```

---

*最后更新：2026-04-10 by OpenClaw Agent 🤖*
