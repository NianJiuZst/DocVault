# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

#### Backend

- **Environment Validation** (`src/config/validation.schema.ts`)
  - Full environment variable validation with Joi: `DATABASE_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`

- **Documents Module** (`src/modules/documents/`)
  - `POST /documents/create` — Create new document
  - `POST /documents/update` — Update document (auto-creates version snapshot before saving)
  - `POST /documents/delete` — Delete document (ownership verified)
  - `GET  /documents/list` — Paginated document list by user
  - `GET  /documents/:id` — Get single document by ID
  - `GET  /documents/:id/versions` — Get version history
  - `POST /documents/:id/rollback` — Rollback to specific version
  - `POST /documents/:id/share` — Share document with another user (`viewer` | `editor`)
  - `DELETE /documents/:id/share/:targetUserId` — Revoke share
  - `GET  /documents/:id/shares` — List all shares for a document
  - `POST /documents/:id/share-link` — Generate public share link
  - `GET  /documents/shared/:token` — Access document via share token
  - `GET  /documents/shared` — List documents shared with current user
  - `GET  /documents/search?q=` — Full-text document search by title

- **Auth Module** (`src/modules/auth/`)
  - `POST /auth/logout` — Clear JWT cookie
  - `GET  /auth/token` — Retrieve current JWT token (for WebSocket auth)

- **Collaboration Module** (`src/modules/collaboration/`)
  - Hocuspocus WebSocket server on port `1234`
  - JWT-based authentication for WebSocket connections
  - Online user awareness tracking

- **Database Schema** (`prisma/schema.prisma`)
  - `Document` — `isPublic`, `shareToken` fields added
  - `DocumentShare` model — user-level permissions (`viewer` / `editor`)
  - `DocumentVersion` — version snapshots with `version` number
  - `User.shares` relation to `DocumentShare`

- **Unit Tests** (`src/modules/**/__tests__/`)
  - 47 tests across 6 test suites, 100% pass rate
  - `auth.service.spec.ts` — GitHub OAuth flow (token exchange, user creation, JWT generation)
  - `auth.guard.spec.ts` — JWT cookie validation, expired/invalid token handling
  - `users.service.spec.ts` — findOrCreate upsert logic, user not found fallback
  - `documents.service.spec.ts` — CRUD, ownership checks, permission enforcement, sharing, search
  - `documents.controller.spec.ts` — All REST endpoints, parameter routing
  - `collaboration.service.spec.ts` — Service lifecycle (init/destroy)

#### Frontend

- **Cloud Docs Page** (`app/home/cloud-docs/page.tsx`)
  - Real API integration (replaced mock data)
  - Document list with pagination
  - "My Documents" tab — calls `GET /documents/list`
  - "Shared with Me" tab — calls `GET /documents/shared`, shows permission badge
  - "New Document" button — calls `POST /documents/create` and navigates to editor

- **Document Editor** (`app/home/cloud-docs/[id]/page.tsx`)
  - Document content loaded from `GET /documents/:id`
  - Auto-save with 2s debounce on every edit
  - Save status indicator (保存中 / 已保存 / 保存失败)
  - Real-time collaboration via `@hocuspocus/provider` + Yjs
  - Online collaborator count display
  - Tiptap upgraded to `3.20.5` (compatible with collaboration extension)

- **SearchBar** (`components/SearchBar.tsx`)
  - Real-time search dropdown on input
  - Calls `GET /documents/search?q=`
  - Click result navigates to `/home/cloud-docs/:id`

- **Messages Page** (`app/home/messages/page.tsx`)
  - Placeholder UI for future collaboration notifications / comments feature

- **Calendar Page** (`app/home/calendar/page.tsx`)
  - Placeholder UI for future document due dates / scheduling feature

### Fixed

- `DocumentShare` model missing `user` relation field (Prisma schema validation error)
- `Document.shareToken` missing `@unique` causing `findUnique` query failure
- `version.content` null type incompatible with `InputJsonValue` (added type cast)
- `onConnect` / `onDisconnect` callbacks in Hocuspocus service must return `Promise<void>`
- `auth.controller.ts` — `GET /auth/token` response type fixed (`res.json` instead of `return res.json`)
- Documents controller uses `Request` type alias with proper `as any` casting for `_user`

### Changed

- `AppModule` — registered `CollaborationModule`
- `DocumentsModule` — exports `DocumentsService` for use by other modules
- Backend `.env` validation now enforces `JWT_SECRET` minimum length
- Frontend Tiptap packages upgraded from `^3.7.2` to `^3.20.5` for collaboration compatibility
- `StarterKit` history disabled in collaborative mode (Yjs handles undo/redo)

---

## [1.0.0] — Initial Feature Baseline

- GitHub OAuth authentication flow
- Basic document editor with Tiptap (bold, italic, headings, lists, code blocks, blockquote)
- Suggestion menu (`/`) command palette
- YouTube video embedding extension
- PostgreSQL + Prisma ORM
- JWT-based authentication (HttpOnly cookie)
