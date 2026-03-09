# Vibe Kanban - Project Context & Feature Map

> **Production URL**: https://vk.intelli-verse-x.ai/  
> **Repository**: BloopAI/vibe-kanban  
> **Generated**: March 10, 2026

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VIBE KANBAN PLATFORM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   Local Web     │     │   Remote Web    │     │   NPX CLI       │       │
│  │ (local-web/)    │     │ (remote-web/)   │     │ (npx-cli/)      │       │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘       │
│           │                       │                       │                 │
│           └───────────────────────┼───────────────────────┘                 │
│                                   │                                         │
│                         ┌─────────▼─────────┐                              │
│                         │    Web Core       │                              │
│                         │  (shared React)   │                              │
│                         │  web-core/        │                              │
│                         └─────────┬─────────┘                              │
│                                   │                                         │
│           ┌───────────────────────┼───────────────────────┐                │
│           │                       │                       │                 │
│  ┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐       │
│  │  Local Server   │     │  Remote Server  │     │    API Types    │       │
│  │  (crates/       │     │  (crates/       │     │  (crates/       │       │
│  │   server/)      │     │   remote/)      │     │   api-types/)   │       │
│  └────────┬────────┘     └────────┬────────┘     └─────────────────┘       │
│           │                       │                                         │
│  ┌────────▼────────┐     ┌────────▼────────┐                               │
│  │  SQLite (local) │     │ PostgreSQL +    │                               │
│  │                 │     │ ElectricSQL     │                               │
│  └─────────────────┘     └─────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure & Module Map

### **Backend (Rust Workspace)**

| Crate | Path | Purpose | Key Components |
|-------|------|---------|----------------|
| **api-types** | `crates/api-types/` | Shared API types | Issue, Project, User, Workbook types |
| **server** | `crates/server/` | Local API server | Issue CRUD, Git integration, Executors |
| **remote** | `crates/remote/` | Cloud API server | Auth, Projects, Organizations, Workbook |
| **db** | `crates/db/` | Database models | SQLx migrations, models |
| **executors** | `crates/executors/` | Agent execution | MCP, Profiles, Task runners |
| **git** | `crates/git/` | Git operations | Commits, Branches, Diff |
| **git-host** | `crates/git-host/` | Git hosting API | GitHub/GitLab integration |
| **services** | `crates/services/` | Business logic | Issue service, Notifications |
| **utils** | `crates/utils/` | Utilities | Logging, Config, Helpers |
| **mcp** | `crates/mcp/` | MCP Protocol | Model Context Protocol client |
| **review** | `crates/review/` | Code review | PR review tool |
| **deployment** | `crates/deployment/` | Deploy utils | Cloud deployment helpers |
| **relay-tunnel** | `crates/relay-tunnel/` | Tunneling | Secure relay connections |

### **Frontend (TypeScript/React)**

| Package | Path | Purpose | Key Features |
|---------|------|---------|--------------|
| **web-core** | `packages/web-core/` | Shared React library | All UI components, hooks, pages |
| **local-web** | `packages/local-web/` | Local app shell | Entry point for desktop |
| **remote-web** | `packages/remote-web/` | Cloud app shell | Entry point for web |
| **ui** | `packages/ui/` | UI primitives | Tailwind, shadcn components |
| **public** | `packages/public/` | Static assets | Icons, images |

### **Shared**

| Path | Purpose | Generated From |
|------|---------|----------------|
| `shared/types.ts` | Local API types | `crates/server/src/bin/generate_types.rs` |
| `shared/remote-types.ts` | Remote API types | `crates/remote/src/bin/remote-generate-types.rs` |
| `shared/schemas/` | Agent tool schemas | Auto-generated JSON schemas |

---

## 🎯 Feature Map

### **1. Core Issue Management**

```
┌──────────────────────────────────────────────────────────────┐
│                    ISSUE MANAGEMENT                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 ISSUES                                                   │
│  ├── Create/Edit/Delete Issues                               │
│  ├── Priority Levels (urgent/high/medium/low)                │
│  ├── Status Columns (Kanban workflow)                        │
│  ├── Drag & Drop reordering                                  │
│  ├── Sub-tasks (parent/child hierarchy)                      │
│  ├── Tags & Labels                                           │
│  ├── Assignees                                               │
│  ├── Due dates & Timelines                                   │
│  └── Rich text descriptions                                  │
│                                                              │
│  💬 COLLABORATION                                            │
│  ├── Issue Comments                                          │
│  ├── Comment Reactions (emoji)                               │
│  ├── Issue Followers                                         │
│  ├── @mentions                                               │
│  └── Activity timeline                                       │
│                                                              │
│  🔗 RELATIONSHIPS                                            │
│  ├── Blocks/Blocked-by                                       │
│  ├── Relates-to                                              │
│  └── Duplicates                                              │
│                                                              │
│  📎 ATTACHMENTS                                              │
│  ├── File uploads                                            │
│  ├── Image previews                                          │
│  └── Blob storage (S3-compatible)                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Files:**
- Backend: `crates/remote/src/routes/issues.rs`, `crates/remote/src/db/issues.rs`
- Frontend: `packages/web-core/src/pages/issues/`
- Types: `crates/api-types/src/issue.rs`

---

### **2. Project Management**

```
┌──────────────────────────────────────────────────────────────┐
│                   PROJECT MANAGEMENT                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📁 PROJECTS                                                 │
│  ├── Create/Edit/Archive projects                            │
│  ├── Project settings & configuration                        │
│  ├── Custom status columns                                   │
│  ├── Project-level tags                                      │
│  └── Notification preferences                                │
│                                                              │
│  🏢 ORGANIZATIONS                                            │
│  ├── Multi-org support                                       │
│  ├── Organization settings                                   │
│  ├── Team management                                         │
│  └── Billing (cloud)                                         │
│                                                              │
│  👥 MEMBERS & ROLES                                          │
│  ├── Owner / Admin / Member roles                            │
│  ├── Invite via email                                        │
│  ├── Role-based permissions                                  │
│  └── Organization-level RBAC                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Files:**
- Backend: `crates/remote/src/routes/projects.rs`, `crates/remote/src/routes/organizations.rs`
- Frontend: `packages/web-core/src/pages/projects/`
- Types: `crates/api-types/src/project.rs`, `crates/api-types/src/organizations.rs`

---

### **3. Workbook PM Features** ⭐ NEW

```
┌──────────────────────────────────────────────────────────────┐
│                  WORKBOOK PM FEATURES                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 FEATURES                                                 │
│  ├── Feature tracking with keys (FT-XXXX)                    │
│  ├── Status: backlog/in_progress/done/blocked                │
│  ├── Priority: low/medium/high/critical                      │
│  ├── Progress percentage (0-100%)                            │
│  ├── Owner assignment                                        │
│  └── Start/Target dates                                      │
│                                                              │
│  📊 KPIs                                                     │
│  ├── KPI tracking with keys (KPI-XXXX)                       │
│  ├── Target vs Current value                                 │
│  ├── Unit of measurement                                     │
│  ├── Frequency: daily/weekly/monthly/quarterly/yearly        │
│  └── Status: on_track/at_risk/off_track/achieved             │
│                                                              │
│  🐛 BUGS                                                     │
│  ├── Bug tracking with keys (BUG-XXXX)                       │
│  ├── Severity: low/medium/high/critical                      │
│  ├── Status: open/in_progress/resolved/closed/wont_fix       │
│  ├── Steps to reproduce                                      │
│  ├── Environment details                                     │
│  └── Related feature linking                                 │
│                                                              │
│  ⚠️ RISKS                                                    │
│  ├── Risk tracking with keys (RSK-XXXX)                      │
│  ├── Category: technical/resource/schedule/budget/etc        │
│  ├── Probability: low/medium/high                            │
│  ├── Impact: low/medium/high/critical                        │
│  ├── Status: identified/analyzing/mitigating/monitoring      │
│  ├── Mitigation plan                                         │
│  └── Contingency plan                                        │
│                                                              │
│  🏃 SPRINTS                                                  │
│  ├── Sprint planning with keys (SPR-XXXX)                    │
│  ├── Sprint goals                                            │
│  ├── Status: planning/active/completed/cancelled             │
│  ├── Velocity tracking                                       │
│  ├── Capacity planning                                       │
│  └── Sprint items with story points                          │
│                                                              │
│  🚀 RELEASES                                                 │
│  ├── Release tracking with keys (REL-XXXX)                   │
│  ├── Version numbers                                         │
│  ├── Type: major/minor/patch/hotfix                          │
│  ├── Status: planning/in_progress/testing/released           │
│  ├── Planned vs actual release dates                         │
│  └── Release notes                                           │
│                                                              │
│  ⏱️ TIME ENTRIES                                             │
│  ├── Time logging per issue/feature                          │
│  ├── Duration in minutes                                     │
│  ├── Billable tracking                                       │
│  └── Date-based tracking                                     │
│                                                              │
│  💬 USER FEEDBACK                                            │
│  ├── Feedback capture with keys (FB-XXXX)                    │
│  ├── Source: app_store/play_store/email/support/etc          │
│  ├── Sentiment: positive/neutral/negative                    │
│  ├── Category: feature_request/bug_report/improvement        │
│  ├── Status: new/reviewing/planned/implemented               │
│  └── Customer info tracking                                  │
│                                                              │
│  📈 DASHBOARD                                                │
│  ├── Feature count                                           │
│  ├── KPI count                                               │
│  ├── Bug count (total/open)                                  │
│  ├── Risk count (total/open)                                 │
│  ├── Sprint status                                           │
│  ├── Release count                                           │
│  ├── Feedback count                                          │
│  └── Time tracking summary                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Files:**
- Backend DB: `crates/remote/src/db/workbook.rs`
- Backend Routes: `crates/remote/src/routes/workbook.rs`
- Migration: `crates/remote/migrations/20260309000000_workbook_features.sql`
- API Types: `crates/api-types/src/workbook.rs`
- Frontend Hooks: `packages/web-core/src/shared/hooks/workbook/useWorkbookApi.ts`
- Frontend Types: `packages/web-core/src/pages/workbook/tabs/types.ts`
- Frontend UI: `packages/web-core/src/pages/workbook/`

---

### **4. Authentication & Authorization**

```
┌──────────────────────────────────────────────────────────────┐
│                 AUTH & AUTHORIZATION                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔐 AUTHENTICATION                                           │
│  ├── Email/Password login                                    │
│  ├── OAuth providers (GitHub, Google)                        │
│  ├── JWT token management                                    │
│  ├── Session handling                                        │
│  └── Secure cookie storage                                   │
│                                                              │
│  🛡️ AUTHORIZATION                                            │
│  ├── Organization-level roles                                │
│  │   ├── Owner (full access)                                 │
│  │   ├── Admin (manage members)                              │
│  │   └── Member (standard access)                            │
│  ├── Project-level permissions                               │
│  │   ├── Read / Write / Admin                                │
│  │   └── Inherited from org role                             │
│  └── API key authentication                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Files:**
- Backend: `crates/remote/src/auth/`, `crates/remote/src/routes/oauth.rs`
- Frontend: `packages/web-core/src/shared/hooks/workbook/useProjectRole.ts`

---

### **5. Git Integration**

```
┌──────────────────────────────────────────────────────────────┐
│                    GIT INTEGRATION                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📂 REPOSITORY MANAGEMENT                                    │
│  ├── GitHub App integration                                  │
│  ├── Repository connection                                   │
│  ├── Branch listing                                          │
│  └── Commit history                                          │
│                                                              │
│  🔀 PULL REQUESTS                                            │
│  ├── PR creation from issues                                 │
│  ├── PR status tracking                                      │
│  ├── Review comments                                         │
│  └── Merge status                                            │
│                                                              │
│  🤖 CODE REVIEW                                              │
│  ├── AI-assisted reviews                                     │
│  ├── Review tool (`crates/review/`)                          │
│  └── Comment suggestions                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Files:**
- Backend: `crates/git/`, `crates/git-host/`, `crates/remote/src/routes/pull_requests.rs`
- Frontend: `packages/web-core/src/pages/pullRequests/`

---

### **6. Notifications & Real-time**

```
┌──────────────────────────────────────────────────────────────┐
│              NOTIFICATIONS & REAL-TIME                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔔 NOTIFICATIONS                                            │
│  ├── In-app notifications                                    │
│  ├── Email notifications                                     │
│  ├── Notification preferences                                │
│  └── Read/Unread state                                       │
│                                                              │
│  ⚡ REAL-TIME SYNC                                           │
│  ├── ElectricSQL integration                                 │
│  ├── Live data synchronization                               │
│  ├── Optimistic updates                                      │
│  └── Conflict resolution                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Files:**
- Backend: `crates/remote/src/routes/notifications.rs`, `crates/remote/src/db/electric_publications.rs`
- Frontend: `packages/web-core/src/shared/hooks/` (React Query)

---

### **7. Agent Execution**

```
┌──────────────────────────────────────────────────────────────┐
│                   AGENT EXECUTION                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🤖 EXECUTORS                                                │
│  ├── MCP (Model Context Protocol) client                     │
│  ├── Agent profiles                                          │
│  ├── Task execution                                          │
│  └── Command runners                                         │
│                                                              │
│  📋 PROFILES                                                 │
│  ├── Default agent profiles                                  │
│  ├── Custom profile support                                  │
│  └── Profile configuration                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Files:**
- Backend: `crates/executors/`, `crates/mcp/`
- Config: `crates/executors/default_mcp.json`, `crates/executors/default_profiles.json`

---

## 📊 Database Schema Overview

### **Local (SQLite)**
- Managed by `crates/db/migrations/`
- Used for offline-first local development

### **Remote (PostgreSQL + ElectricSQL)**
- Managed by `crates/remote/migrations/`
- Real-time sync enabled
- Key tables with REPLICA IDENTITY FULL:
  - `users`, `organizations`, `projects`, `issues`
  - `features`, `kpis`, `bugs`, `risks`, `sprints`
  - `releases`, `time_entries`, `user_feedback`

---

## 🔧 Development Commands

| Command | Purpose |
|---------|---------|
| `pnpm i` | Install dependencies |
| `pnpm run dev` | Start development (web + backend) |
| `pnpm run backend:dev:watch` | Backend with hot reload |
| `pnpm run local-web:dev` | Frontend dev server |
| `pnpm run check` | Type check all packages |
| `pnpm run backend:check` | Cargo check |
| `pnpm run format` | Format all code |
| `pnpm run lint` | Lint all code |
| `cargo test --workspace` | Run Rust tests |
| `pnpm run generate-types` | Generate TS types from Rust |
| `pnpm run remote:generate-types` | Generate remote TS types |
| `pnpm run prepare-db` | Prepare SQLx offline cache |
| `pnpm run remote:prepare-db` | Prepare remote SQLx cache |

---

## 🌐 API Endpoints (Remote)

### **Workbook API** (v1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/projects/:id/workbook/dashboard` | Get dashboard stats |
| `GET` | `/v1/projects/:id/workbook/features` | List features |
| `POST` | `/v1/projects/:id/workbook/features` | Create feature |
| `GET` | `/v1/workbook/features/:id` | Get feature |
| `PATCH` | `/v1/workbook/features/:id` | Update feature |
| `DELETE` | `/v1/workbook/features/:id` | Delete feature |
| | | *Similar patterns for:* |
| | | KPIs, Bugs, Risks, Sprints |
| | | Releases, TimeEntries, Feedback |

---

## 🔒 Security Considerations

1. **Authentication**: JWT tokens with secure cookie storage
2. **Authorization**: Organization-level RBAC inherited to projects
3. **Data Access**: All routes verify project membership
4. **API Keys**: Scoped to specific operations
5. **Secrets**: `.env` for local; environment variables in production

---

## 📝 Type Generation Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Rust Types     │────▶│   ts-rs         │────▶│  TypeScript     │
│  (api-types/)   │     │  #[derive(TS)]  │     │  (shared/)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Local types**: `pnpm run generate-types` → `shared/types.ts`
- **Remote types**: `pnpm run remote:generate-types` → `shared/remote-types.ts`

---

## 🎨 UI Component Library

Located in `packages/web-core/src/`:

| Directory | Contents |
|-----------|----------|
| `components/` | Reusable UI components |
| `pages/` | Page-level components |
| `shared/` | Hooks, utils, lib |
| `i18n/` | Internationalization |

Uses:
- **React 19** with Server Components
- **Tailwind CSS** for styling
- **shadcn/ui** for primitives
- **React Query** for data fetching
- **React Router** for navigation

---

*Last updated: March 10, 2026*
