# DocVault 开发计划

> 协作文档编辑器 · 基于 Tiptap + Next.js 15 + NestJS 11

---

## 📊 项目现状

### 已完成功能

| 分类 | 功能 | 状态 |
|------|------|------|
| **认证** | GitHub OAuth 登录 | ✅ |
| **文档编辑** | 富文本编辑（标题/列表/代码块/引用） | ✅ |
| **文档管理** | CRUD + 版本历史 + 回滚 | ✅ |
| **文档分享** | 用户级分享（viewer/editor）+ 公开链接 | ✅ |
| **实时协作** | Yjs + Hocuspocus WebSocket 协同编辑 | ✅ |
| **主题** | Dark/Light Mode 切换 | ✅ |
| **搜索** | 文档标题全文搜索 | ✅ |
| **测试** | 单元测试（后端 47 个，前端 8 个）+ E2E（6 个，待环境） | ✅ |
| **CI/CD** | GitHub Actions 自动测试 | ✅ |

### 待优化/开发功能

| 优先级 | 功能模块 | 说明 |
|--------|----------|------|
| 🔴 高 | Markdown 导入/导出 | 支持导出 .md / .pdf / .docx |
| 🟡 中 | 评论与批注 | 文档内评论、@提及、批注功能 |
| 🟡 中 | 用户画像 | 个人资料、头像、密码修改 |
| 🟡 中 | 通知中心 | 分享通知、协作通知、系统通知 |
| 🟢 低 | 文档模板 | 预设模板（周报/PRD/会议纪要） |
| 🟢 低 | 离线支持 | PWA + Service Worker 离线缓存 |
| 🟢 低 | 移动端优化 | 响应式布局、移动端编辑器适配 |
| 🟢 低 | 图表扩展 | Tiptap 集成图表、流程图（Mermaid） |

---

## 🎯 开发阶段规划

### 阶段一：Markdown 导入/导出
**预计周期：** 1 周

**目标：** 支持文档的导入导出，打通外部生态

**后端任务：**
- [ ] `GET /documents/:id/export?format=md` 导出 Markdown
- [ ] `GET /documents/:id/export?format=json` 导出 JSON（保留格式）
- [ ] `POST /documents/import` 导入 Markdown
- [ ] 导出时的图片处理（base64 或 CDN 链接）

**前端任务：**
- [ ] 文档编辑器内添加「导出」按钮（下拉：Markdown / PDF）
- [ ] 「导入」按钮（从本地上传 .md 文件）
- [ ] 导出进度提示

---

### 阶段二：评论与批注
**预计周期：** 2-3 周

**目标：** 支持文档内评论和 @提及

**后端任务：**
- [ ] `Comment` 数据模型（id, documentId, userId, content, parentId, position?, createdAt）
- [ ] `POST /documents/:id/comments` 添加评论
- [ ] `GET /documents/:id/comments` 获取评论列表
- [ ] `DELETE /comments/:id` 删除评论
- [ ] `@username` 解析与通知触发
- [ ] WebSocket 实时推送新评论
- [ ] 评论单元测试

**前端任务：**
- [ ] 文档右侧评论面板（类似 Notion）
- [ ] 选中文本创建批注（highlight + 弹出评论框）
- [ ] @提及自动补全（用户搜索）
- [ ] 评论通知 Badge（导航栏红点）
- [ ] 评论富文本（支持 @链接、代码片段）

---

### 阶段三：用户画像与通知中心
**预计周期：** 1-2 周

**目标：** 完善用户系统和通知功能

**后端任务：**
- [ ] `User` 表增加 `avatar`, `bio` 字段
- [ ] `PATCH /users/me` 更新个人资料
- [ ] `PATCH /users/me/password` 修改密码
- [ ] `Notification` 数据模型（id, userId, type, content, read, createdAt）
- [ ] `GET /notifications` 获取通知列表
- [ ] `PATCH /notifications/:id/read` 标记已读
- [ ] `POST /notifications/mark-all-read` 全部已读
- [ ] WebSocket 实时推送通知
- [ ] 通知单元测试

**前端任务：**
- [ ] 用户设置页面（头像上传、昵称、密码修改）
- [ ] 通知下拉面板（分享提醒、评论提醒、@提及）
- [ ] 未读通知红点 Badge
- [ ] 通知声音提示（可选）

---

### 阶段四：文档模板 + 离线支持
**预计周期：** 1-2 周

**目标：** 提升内容创作效率和多端使用体验

**后端任务：**
- [ ] `Template` 数据模型（id, name, content, category, isPublic, ownerId）
- [ ] `GET /templates` 获取模板列表
- [ ] `POST /templates` 创建模板
- [ ] `POST /documents/from-template` 从模板创建文档
- [ ] Service Worker 注册与缓存策略

**前端任务：**
- [ ] 模板市场页面（预设模板：周报/PRD/会议纪要/复盘）
- [ ] 「新建文档」弹窗增加「从模板创建」选项
- [ ] PWA manifest 配置
- [ ] 离线状态检测 + 本地草稿缓存
- [ ] 在线状态恢复提示

---

## 🛠️ 技术债务与优化

| 类型 | 问题 | 解决方案 |
|------|------|----------|
| 性能 | 文档列表无分页（前端全量加载） | 已有 pagination，需检查 UI 是否正确显示 |
| 性能 | 实时协作大文档可能卡顿 | Yjs 分片优化 + 懒加载历史版本 |
| 安全 | 缺少速率限制（Rate Limiting） | NestJS @nestjs/throttler |
| 安全 | 导出接口无权限校验 | 检查 owner/shared 逻辑 |
| 可维护性 | 后端模块间耦合较重 | 逐步抽离 shared 模块 |
| 可维护性 | 前后端类型未共享 | 考虑 tRPC 或共享 schema |

---

## 📈 迭代建议

1. **优先完成 Markdown 导入/导出** — 实用性强，打通外部生态
2. **评论系统可以后期做** — 初期协作场景简单，暂无强需求
3. **PWA 离线支持看情况** — 如果用户有移动端使用场景再重点做
4. **每次 PR 细分 commit** — 参考 Git 规范：feat/fix/refactor/test/doc

---

## 📝 Commit 规范

```
feat/export: add markdown export endpoint
feat/export: add PDF export with html-pdf
feat/export: implement export dropdown in editor UI
fix/export: handle large images in base64 export
test/export: add unit tests for export service
```

---

*计划制定于 2026-03-27 by 彤子2号 🌸*
