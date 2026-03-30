# DocVault AI 项目指南

> 本文件面向 AI 助手（Claude Code、Codex 等），用于快速理解 DocVault 项目的架构、业务逻辑和技术细节，从而能够正确执行用户的代码修改、调试和功能开发指令。
>
> **项目定位：** 一个支持多人协作的云文档平台，核心功能包括文档编辑、Markdown 导入导出、PDF 导出、模板管理、文件夹树管理、AI 对话辅助等。

---

## 目录

1. [项目架构总览](#1-项目架构总览)
2. [技术栈](#2-技术栈)
3. [数据库模型](#3-数据库模型)
4. [后端模块详解](#4-后端模块详解)
5. [前端模块详解](#5-前端模块详解)
6. [核心业务流程](#6-核心业务流程)
7. [API 接口一览](#7-api-接口一览)
8. [关键代码位置索引](#8-关键代码位置索引)
9. [AI 执行指南](#9-ai-执行指南)
10. [开发规范](#10-开发规范)

---

## 1. 项目架构总览

### 1.1 目录结构

```
DocVault/
├── packages/
│   ├── backend/          # NestJS 后端服务（端口 3001）
│   │   ├── src/
│   │   │   ├── main.ts                  # 入口，启用 CORS、Cookie
│   │   │   ├── app.module.ts            # 根模块
│   │   │   ├── prisma/                  # Prisma ORM
│   │   │   └── modules/
│   │   │       ├── auth/                # GitHub OAuth 认证
│   │   │       ├── documents/            # 文档 CRUD、树、导入导出
│   │   │       ├── collaboration/       # 实时协作（Yjs + Hocuspocus）
│   │   │       ├── templates/           # 模板管理
│   │   │       ├── users/               # 用户管理
│   │   │       └── shared/              # JWT、工具函数等共享模块
│   │   ├── prisma/
│   │   │   └── schema.prisma            # 数据库 schema
│   │   └── test/                        # E2E 测试配置
│   │
│   └── frontend/         # Next.js 前端（端口 3000）
│       ├── app/
│       │   ├── page.tsx                  # 落地页（Landing Page）
│       │   ├── login/                   # 登录页
│       │   ├── home/                    # 登录后的主应用
│       │   │   ├── layout.tsx           # 三栏布局（侧边栏 + 内容 + AI 面板）
│       │   │   ├── cloud-docs/          # Workspace 文档管理
│       │   │   │   ├── [id]/page.tsx    # 文档编辑器页面（TipTap）
│       │   │   │   └── components/      # FormattingToolbar、TemplateSelectorModal 等
│       │   │   ├── knowledge-base/      # Favorites 收藏页
│       │   │   ├── notes/               # Personal Notes 页
│       │   │   ├── shared/               # Shared Docs 页
│       │   │   ├── plugins/             # Plugins 页
│       │   │   ├── calendar/            # 日历页
│       │   │   └── messages/            # AI 对话消息页
│       │   ├── components/              # 全局组件（SearchBar 等）
│       │   ├── api/                     # API 路由（代理转发）
│       │   └── auth/github/             # GitHub OAuth 回调处理
│       ├── extension/                   # 自定义 TipTap 扩展
│       │   ├── SuggestionMenu/          # @ 提及菜单
│       │   └── YouTube/                 # YouTube 嵌入
│       └── package.json
│
├── docs/                    # 项目文档
├── docker-compose.yml       # 生产部署
└── docker-compose.dev.yml    # 开发环境部署
```

### 1.2 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Next.js)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  侧边栏导航  │  │  文档编辑器  │  │   AI 对话面板      │ │
│  │  (FolderTree│  │  (TipTap)    │  │ (DocVaultAssistant)│ │
│  │   + Search) │  │              │  │                    │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│              Backend (NestJS, 端口 3001)                    │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ Auth模块  │  │ Documents模块│  │ Collaboration模块  │   │
│  │(JWT+Cookie│  │ (CRUD+Tree)  │  │ (Yjs+Hocuspocus)   │   │
│  └──────────┘  └──────────────┘  └─────────────────────┘   │
│  ┌──────────┐  ┌──────────────┐                            │
│  │Users模块  │  │Templates模块 │                            │
│  └──────────┘  └──────────────┘                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼──────────────────────────────────┐
│                 PostgreSQL Database                          │
│  User | Document | DocumentVersion | DocumentShare | Template│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈

### 2.1 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | App Router | React 框架，路由管理 |
| **TypeScript** | ^5.9 | 类型安全 |
| **Tailwind CSS** | ^3.4 | 样式（inline className） |
| **TipTap** | ^2.x | 富文本编辑器核心 |
| **Yjs** + **Hocuspocus** | - | 实时协作（CRDT） |
| **react-icons** | - | 图标库（主要用 `react-icons/md`） |
| **Mantine** | ^7.x | UI 组件库（Popover、Slider、TextInput） |
| **Vitest** | - | 单元测试 |

### 2.2 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| **NestJS** | ^11 | Node.js Web 框架 |
| **TypeScript** | ^5.9 | 类型安全 |
| **Prisma** | ^6.16 | ORM（PostgreSQL） |
| **JWT** | - | Token 认证 |
| **cookie-parser** | - | Cookie 解析 |
| **Jest** | - | 单元测试 |

### 2.3 数据库

| 技术 | 用途 |
|------|------|
| **PostgreSQL** | 主数据库 |
| **Prisma Migrate** | 数据库迁移 |

### 2.4 协作

| 技术 | 用途 |
|------|------|
| **Yjs** | CRDT 冲突无关数据结构 |
| **Hocuspocus** | WebSocket 协作服务端 |
| **TipTap Collaboration Extension** | 编辑器协作支持 |

---

## 3. 数据库模型

> **文件位置：** `packages/backend/prisma/schema.prisma`

### 3.1 User

```prisma
model User {
  id           Int    @id @default(autoincrement())
  githubUserId String @unique  // GitHub OAuth 唯一标识
  name         String
  avatar       String
  email        String?
  documents    Document[]
  shares       DocumentShare[]
  templates    Template[]
}
```

### 3.2 Document（文档/文件夹共用）

```prisma
model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   Json?    // Tiptap JSON，null 表示文件夹
  userId    Int
  user      User     @relation(...)
  isFolder  Boolean  @default(false)  // 区分文档和文件夹
  parentId  Int?     // 自引用，null = 根级
  parent    Document?  @relation("DocumentTree", fields: [parentId], references: [id], onDelete: Cascade)
  children  Document[] @relation("DocumentTree")
  // ... versions, shares, searchVector
}
```

**重要规则：**
- `isFolder = true` 且 `content = null` 表示文件夹
- `isFolder = false` 且 `content != null` 表示文档
- 文件夹和文档统一通过 `parentId` 形成树结构
- 删除文件夹级联删除所有子节点（`onDelete: Cascade`）

### 3.3 DocumentVersion（版本历史）

```prisma
model DocumentVersion {
  id         Int
  documentId Int
  version    Int      // 版本号递增
  content    Json     // Tiptap JSON 快照
  updatedAt  DateTime
}
```

### 3.4 DocumentShare（文档分享）

```prisma
model DocumentShare {
  id          Int  @id @default(autoincrement())
  documentId  Int
  userId      Int
  permission  String  // "viewer" | "editor"
  @@unique([documentId, userId])
}
```

### 3.5 Template（模板）

```prisma
model Template {
  id        Int
  name      String
  content   Json     // Tiptap JSON
  category  String   // "weekly_report" | "meeting_notes" | "retro" | "prd"
  isPublic  Boolean @default(false)
  ownerId   Int
  owner     User
}
```

---

## 4. 后端模块详解

### 4.1 Auth 模块

**文件位置：** `modules/auth/`

**功能：** GitHub OAuth 登录

**流程：**
1. 前端访问 `/auth/github` → 重定向到 GitHub OAuth
2. GitHub 回调到 `/auth/github/callback` → 换取 Access Token
3. 用 Access Token 获取 GitHub 用户信息 → 创建/查找 User 记录
4. 签发 JWT Token，通过 `Set-Cookie` 返回（`httpOnly: true`）
5. 前端通过 `/users/me` 验证登录状态

**关键接口：**
- `GET /auth/github` — GitHub OAuth 入口
- `GET /auth/github/callback` — OAuth 回调
- `POST /auth/logout` — 登出，清除 Cookie

**Guard：** `AuthGuard` 保护需要登录的接口，读取 Cookie 中的 JWT，验证通过才放行。

### 4.2 Documents 模块

**文件位置：** `modules/documents/`

**功能：** 文档和文件夹的完整 CRUD、树查询、导入导出、版本管理

**核心 Service 方法：**

| 方法 | 说明 |
|------|------|
| `find(id, userId)` | 查询单个文档（支持共享访问） |
| `findAll(userId, query)` | 分页查询用户文档 |
| `create(dto, userId)` | 创建文档（支持 parentId 嵌套） |
| `createFolder(title, userId, parentId?)` | 创建文件夹 |
| `update(id, dto, userId)` | 更新标题/内容 |
| `delete(id, userId)` | 删除文档或文件夹 |
| `getTree(userId)` | 获取用户完整树结构 |
| `moveDocument(id, parentId, userId)` | 移动文档到目标文件夹 |
| `exportAsMarkdown(id, userId)` | 导出为 Markdown |
| `exportAsPdf(id, userId)` | 导出为 PDF（Tiptap → Markdown → PDF） |
| `importFromMarkdown(title, content, userId, parentId?)` | Markdown 导入 |
| `createVersion(documentId)` | 创建版本快照 |

**创建文档的 DTO：**

```typescript
// packages/backend/src/modules/documents/dto/create-document.dto.ts
class CreateDocumentDto {
  @IsString() title: string;
  @IsOptional() @IsObject() content?: object;
  @IsOptional() @IsNumber() parentId?: number;  // 用于嵌套创建
}
```

### 4.3 Collaboration 模块

**功能：** 基于 Yjs + Hocuspocus 的实时协作编辑

**原理：**
- 多个用户同时编辑同一个文档
- Yjs CRDT 保证最终一致性（无论操作顺序如何）
- Hocuspocus 作为 WebSocket 中转服务器
- 每个文档有一个唯一的 room name（通常为 `doc-{documentId}`）

**前端集成：**
```typescript
const provider = new HocuspocusProvider({
  url: "ws://localhost:1237",  // Hocuspocus WebSocket 地址
  name: `doc-${docId}`,         // Room name
  document: new Y.Doc(),
});
```

### 4.4 Templates 模块

**功能：** 模板 CRUD，支持预设模板类别（周报、会议记录、PRD 等）

**category 枚举：** `weekly_report` | `meeting_notes` | `retro` | `prd`

---

## 5. 前端模块详解

### 5.1 路由结构

```
/                          → 落地页（未登录）
/login                     → 登录页（未登录）
/home/*                    → 登录后才能访问（有三栏布局）
  /home/cloud-docs         → Workspace 文档列表（侧边栏展开的文件夹树）
  /home/cloud-docs/[id]    → 文档编辑器（TipTap）
  /home/knowledge-base     → Favorites 收藏
  /home/notes              → Personal Notes
  /home/shared             → Shared Docs
  /home/plugins            → Plugins
  /home/calendar           → 日历
  /home/messages           → AI 消息对话
/shared/[token]            → 公开分享链接（无需登录）
```

### 5.2 三栏布局（Home Layout）

**文件：** `app/home/layout.tsx`

```
┌─────────────┬───────────────────────────────┬──────────────┐
│  侧边导航栏  │        主内容区域              │  AI 对话面板  │
│  (260px)   │       (flex-1)               │  (320px)    │
│             │                              │ 可收起        │
│ Workspace   │  <Route-specific page>        │              │
│ ├─ Folder1 │                              │ AI Assistant │
│ │  ├─ Doc1 │                              │ (DocVault   │
│ │  └─ Doc2 │                              │  AI)        │
│ └─ Folder2 │                              │              │
│ Favorites   │                              │              │
│ Notes       │                              │              │
│ Shared      │                              │              │
│ Plugins     │                              │              │
└─────────────┴───────────────────────────────┴──────────────┘
```

**侧边栏核心组件：** `FolderTreeInline` — 递归渲染文件夹树，支持：
- 展开/折叠（`expanded` state 管理）
- hover 显示"更多"菜单（⋮）：New Folder / New Document / Delete
- 内联创建输入框
- 点击文档 → 路由到 `/home/cloud-docs/[id]`

**侧边栏状态管理（layout.tsx 内）：**
```typescript
const [tree, setTree] = useState<TreeNode[]>([]);      // 文件夹树数据
const [expanded, setExpanded] = useState<Set<number>>(); // 展开状态
const [moreMenuId, setMoreMenuId] = useState<number|null>(null);  // 当前打开的菜单
const [creatingFolder, setCreatingFolder] = useState(false);
const [creatingDoc, setCreatingDoc] = useState(false);
const [creatingForFolderId, setCreatingForFolderId] = useState<number|null>(null);  // 在哪个文件夹下创建
```

### 5.3 文档编辑器页面

**文件：** `app/home/cloud-docs/[id]/page.tsx`

**技术栈：** TipTap 编辑器（基于 ProseMirror）

**已安装的 TipTap 扩展：**
- `StarterKit` — 基础格式（BOLD, ITALIC, CODE, HEADING, LIST, BLOCKQUOTE 等）
- `TextStyleKit` — 文字样式（颜色等）
- `TaskList` + `TaskItem` — 任务列表（checkbox）
- `Collaboration` — Yjs 实时协作
- `YoutubeExtension` — YouTube 嵌入
- `SuggestionMenu` — @ 提及菜单

**编辑器工具栏：** `components/FormattingToolbar.tsx`
- 图标按钮（react-icons/md）
- 单行展示，分组用竖线分隔
- 支持：粗体、斜体、删除线、代码、H1/H2/H3、列表、引用、分割线、撤销/重做

**编辑器状态管理：**
```typescript
const [activeFormats, setActiveFormats] = useState<string[]>([]);  // 当前激活的格式
const [headingLevel, setHeadingLevel] = useState<0|1|2|3>(0);
const [textColorHue, setTextColorHue] = useState(0);
const [bgColorHue, setBgColorHue] = useState(60);
```

### 5.4 AI 对话面板

**组件：** DocVault Assistant（内置在 layout.tsx）
- 通过 API 代理调用 AI（`/api/responses`）
- 支持 markdown 渲染
- 可收起/展开

**AI 服务地址（前端代理）：**
```
POST /api/responses  →  https://api.baldduck.cn/responses
```

### 5.5 认证流程

**文件：** `app/components/AuthProvider.tsx`

**流程：**
1. 每次路由变化，检查 `/users/me` 是否返回 200
2. 已登录 → 渲染页面；未登录 → 跳转 `/home/login`
3. 登录页点击"使用 GitHub 登录" → 跳转 `/auth/github`
4. GitHub 回调 → 设置 Cookie → 自动跳转首页

**User 类型：**
```typescript
interface User {
  id: number;
  name: string;
  avatar?: string;
  email?: string | null;
  githubUserId: string;
}
```

---

## 6. 核心业务流程

### 6.1 创建嵌套文档/文件夹

**前端（layout.tsx）：**
```
用户点击文件夹的"更多" → 选择"New Document"
  → setCreatingDoc(true), setCreatingForFolderId(folderId)
  → 显示内联输入框
  → 用户输入名称，按 Enter 或点击 Create
  → handleCreateItem(false, folderId)
    → fetch POST /documents/create { title, parentId: folderId }
    → fetchTree() 刷新树
    → expandFolderAndAncestors() 展开所有祖先文件夹
    → router.push(/home/cloud-docs/[新文档ID])
```

**后端（documents.service.ts）：**
```
POST /documents/create
  → CreateDocumentDto { title, parentId? }
  → prisma.document.create({
      data: { title, content: {}, userId, parentId: dto.parentId ?? null }
    })
  → 返回新文档记录
```

**GET /documents/tree（读取树）：**
```
→ prisma.document.findMany({ where: { userId } })
→ 过滤出 parentId === null 的顶级节点
→ 每个节点递归构建 children
→ 返回嵌套的树结构
```

### 6.2 编辑器协作

**单个用户编辑：**
```
用户打开文档 → useEditor() 初始化 TipTap
  → 用户输入 → TipTap 更新内部 state
  → debounced auto-save（通过 API POST /documents/update）
```

**多用户协作：**
```
用户打开文档 → HocuspocusProvider 连接 WebSocket
  → Y.Doc 作为共享状态
  → 其他用户的修改通过 Yjs CRDT 实时同步
  → 本地 TipTap 编辑器响应 Y.Doc 变化
```

### 6.3 导入导出

**Markdown 导出：**
```
用户点击 Export → POST /documents/[id]/export/markdown
  → documents.service.exportAsMarkdown()
  → Tiptap JSON → Markdown 转换
  → 返回 Markdown 文本
  → 前端生成文件下载
```

**PDF 导出：**
```
用户点击 Export → POST /documents/[id]/export/pdf
  → documents.service.exportAsPdf()
  → Tiptap JSON → Markdown → PDF（pdfkit）
  → 返回 PDF Buffer
  → 前端生成文件下载
```

**Markdown 导入：**
```
用户上传 .md 文件 → POST /documents/import/markdown
  → service.importFromMarkdown(title, content, userId, parentId?)
  → 返回新文档记录
  → 路由到新文档页面
```

---

## 7. API 接口一览

> **Base URL：** `http://localhost:3001`
> **认证方式：** Cookie（`httpOnly: true`），需要登录的接口由 `AuthGuard` 保护

### 7.1 认证

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/auth/github` | GitHub OAuth 入口 | 否 |
| GET | `/auth/github/callback` | OAuth 回调 | 否 |
| POST | `/auth/logout` | 登出 | 否 |
| POST | `/users/me` | 获取当前用户信息 | 是 |

### 7.2 文档

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/documents/:id` | 获取单个文档 | 是 |
| GET | `/documents` | 分页列表查询 | 是 |
| POST | `/documents/create` | 创建文档 | 是 |
| POST | `/documents/update` | 更新文档 | 是 |
| POST | `/documents/delete` | 删除文档 | 是 |
| GET | `/documents/tree` | 获取用户完整文件夹树 | 是 |
| POST | `/documents/folder` | 创建文件夹 | 是 |
| POST | `/documents/:id/move` | 移动文档 | 是 |
| POST | `/documents/:id/export/markdown` | 导出为 Markdown | 是 |
| POST | `/documents/:id/export/pdf` | 导出为 PDF | 是 |
| POST | `/documents/import/markdown` | 导入 Markdown | 是 |

**创建文件夹请求体：**
```json
{ "title": "文件夹名", "parentFolderId": 5 }
```

**创建文档请求体：**
```json
{ "title": "文档标题", "parentId": 5 }
```

### 7.3 协作

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| WS | `ws://localhost:1237` | Hocuspocus 协作 WebSocket | 是 |

### 7.4 模板

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/templates` | 获取用户模板列表 | 是 |
| POST | `/templates` | 创建模板 | 是 |

### 7.5 代理（前端）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/responses` | 代理到 AI 服务 |

---

## 8. 关键代码位置索引

### 8.1 后端

| 功能 | 文件路径 |
|------|----------|
| 入口 + CORS | `packages/backend/src/main.ts` |
| 根模块 | `packages/backend/src/app.module.ts` |
| Prisma Schema | `packages/backend/prisma/schema.prisma` |
| 创建文档 DTO | `packages/backend/src/modules/documents/dto/create-document.dto.ts` |
| 文档 Service | `packages/backend/src/modules/documents/documents.service.ts` |
| 文档 Controller | `packages/backend/src/modules/documents/documents.controller.ts` |
| 获取文件夹树 | `documents.service.ts` → `getTree()` |
| 创建嵌套文档 | `documents.service.ts` → `create()` |
| 导出 Markdown | `documents.service.ts` → `exportAsMarkdown()` |
| 导出 PDF | `documents.service.ts` → `exportAsPdf()` |
| Auth Guard | `packages/backend/src/modules/auth/auth.guard.ts` |
| GitHub OAuth | `packages/backend/src/modules/auth/auth.controller.ts` |
| 文档单测 | `packages/backend/src/modules/documents/__tests__/documents.service.spec.ts` |
| Controller 单测 | `packages/backend/src/modules/documents/__tests__/documents.controller.spec.ts` |

### 8.2 前端

| 功能 | 文件路径 |
|------|----------|
| 落地页 | `packages/frontend/app/page.tsx` |
| Home 布局（三栏） | `packages/frontend/app/home/layout.tsx` |
| 文件夹树组件 | `packages/frontend/app/home/layout.tsx`（内联） |
| Workspace 列表页 | `packages/frontend/app/home/cloud-docs/page.tsx` |
| 文档编辑器页 | `packages/frontend/app/home/cloud-docs/[id]/page.tsx` |
| 编辑器工具栏 | `packages/frontend/app/home/cloud-docs/[id]/components/FormattingToolbar.tsx` |
| 模板选择弹窗 | `packages/frontend/app/home/cloud-docs/components/TemplateSelectorModal.tsx` |
| Favorites 页 | `packages/frontend/app/home/knowledge-base/page.tsx` |
| 全局搜索栏 | `packages/frontend/app/components/SearchBar.tsx` |
| 认证 Provider | `packages/frontend/app/components/AuthProvider.tsx` |
| GitHub OAuth 回调 | `packages/frontend/app/auth/github/page.tsx` |
| 登录页 | `packages/frontend/app/login/page.tsx` |
| TipTap @ 提及扩展 | `packages/frontend/extension/SuggestionMenu/` |
| TipTap YouTube 扩展 | `packages/frontend/extension/YouTube/` |
| 前端单测 | `packages/frontend/app/home/__tests__/`（各 page 下） |
| 全局 CSS | `packages/frontend/app/globals.css` |

---

## 9. AI 执行指南

### 9.1 如何执行用户指令

1. **理解意图** — 先明确用户想要什么（功能修改、Bug 修复、测试添加）
2. **确认分支** — 始终在 `feat/workspace-refactor` 分支上开发，除非用户指定其他分支
3. **改动范围** — 只改 `display style`（样式），不碰 `business logic`（业务逻辑）；如果要改业务逻辑，先向用户确认
4. **编码规范** — 遵循项目原有风格；commit message 用英文 feat/fix/refactor/chore/test 等开头
5. **测试验证** — 改动完成后先跑测试，确保全部通过再推送
6. **推送** — `git push origin feat/workspace-refactor`

### 9.2 常用开发命令

**前端：**
```bash
cd packages/frontend
npm run dev      # 开发服务器（localhost:3000）
npm run build    # 生产构建
npm test         # 运行所有测试（Vitest）
npm test -- app/home/cloud-docs  # 只跑特定路径的测试
```

**后端：**
```bash
cd packages/backend
npm run build    # NestJS 编译
npm run start:dev  # 开发模式启动（端口 3001）
npm test          # 运行所有测试（Jest）
npx jest src/modules/documents/__tests__/documents.service.spec.ts  # 只跑特定测试
```

**启动全套开发环境：**
```bash
# 后端（端口 3001）
cd packages/backend && npm run start:dev

# 前端（端口 3000）
cd packages/frontend && npm run dev

# Hocuspocus 协作服务器（端口 1237）
npx @hocuspocus/server
```

### 9.3 Git 规范

```bash
# 提交
git add <files>
git commit -m "feat(frontend): add new feature description"
git push origin feat/workspace-refactor

# 永远不要直接 commit 到 main/master
# 永远不要在 main/master 上开发
```

### 9.4 调试技巧

**查看前端 API 请求：**
- 打开浏览器 DevTools → Network
- 前端 API 请求通常发到 `http://localhost:3001/*`

**后端日志：**
- NestJS 启动后会在控制台打印所有 HTTP 请求

**常见错误：**
- `401 Unauthorized` — 未登录或 JWT 过期
- `403 Forbidden` — 无权限访问该文档
- `404 Not Found` — 文档不存在
- `500 Internal Server Error` — 后端异常，查看后端控制台

### 9.5 测试覆盖要求

| 类型 | 要求 |
|------|------|
| 功能修改 | 必须跑对应模块的测试并通过 |
| Bug 修复 | 先写一个能复现 Bug 的测试，再修复 |
| 新接口 | 后端 service/controller 需写单测 |
| UI 改动 | 前端 vitest 测试需通过 |

**测试通过标准：**
```bash
# 前端（9 个测试文件，38+ 测试）
cd packages/frontend && npx vitest run  # 全部通过

# 后端（9 个测试套件，171+ 测试）
cd packages/backend && npx jest  # 全部通过
```

---

## 10. 开发规范

### 10.1 分支管理

- `main` — 生产分支，**永远不直接推送**
- `feat/*` — 功能分支，所有开发在此进行
- 当前活跃分支：`feat/workspace-refactor`

### 10.2 代码风格

- **TypeScript** — 严格模式，保持类型安全
- **Tailwind CSS** — 使用 inline `className`，不要用 styled-components
- **React** — 函数组件 + Hooks，不用 class 组件
- **图标** — 使用 `react-icons/md`，不要使用 Material Symbols 字体
- **颜色变量** — 在 `globals.css` 中定义 CSS 变量，统一使用

### 10.3 API 设计原则

- RESTful 风格
- 认证通过 Cookie（`credentials: "include"`）
- 请求体/响应体使用 JSON
- 错误时返回有意义的错误信息

### 10.4 前端注意事项

- 所有在 `/home/*` 下的页面有三栏布局（侧边栏 + 内容 + AI 面板）
- 落地页 `/` 是独立全屏页面，**不在**三栏布局内
- 编辑器使用 TipTap，不自行实现富文本
- 文件夹树状态在 layout.tsx 中通过 React Context 或直接在 layout 中管理

### 10.5 后端注意事项

- 使用 Prisma ORM，不要直接写 SQL（除了 full-text search 的 raw SQL）
- 所有需要登录的接口使用 `@UseGuards(AuthGuard)`
- DTO 使用 class-validator 装饰器做校验
- Service 方法中处理业务逻辑，Controller 只做参数解析和响应

### 10.6 当前已知问题/限制

1. **AI 服务**：`POST /api/responses` 代理到 `api.baldduck.cn` 可能返回 401/503，属于外部依赖问题
2. **网络问题**：GitHub 推送可能因 TLS 连接问题失败，重试通常可以成功
3. **协作服务器**：Hocuspocus 需要额外启动，不是默认跟着后端一起启动

---

## 附录 A：环境变量参考

```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/docvault
JWT_SECRET=your-jwt-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
PORT=3001
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 附录 B：常见任务清单

| 任务 | 步骤 |
|------|------|
| 添加新的文档格式按钮 | 1. 在 `FormattingToolbar.tsx` 加按钮 2. 用 `editor.chain().focus().toggleXxx().run()` 3. 用 `useEditorState` 获取激活状态 |
| 添加新的 API 接口 | 1. 后端 controller 加 `@Post/@Get` 2. service 加方法 3. 写单测 4. 前端调用 |
| 修改文件夹树行为 | 1. 改 `layout.tsx` 中的 `FolderTreeInline` 2. 同步改 `handleCreateItem` 等函数 |
| 添加新的 sidebar 菜单项 | 1. 改 `layout.tsx` 中的 `navItems` 数组 2. 添加对应页面 3. 更新 `MEMORY.md` |
| 修复 Bug | 1. 写一个能复现的测试 2. 运行测试确认失败 3. 修复代码 4. 确认测试通过 5. commit + push |

---

*本文档由 AI 自动生成并维护，如有项目结构变更请同步更新。*
