# Repository Guidelines

## Project Structure & Module Organization
- `crates/`: Rust workspace crates:
  - `server` — Local API server + binaries
  - `remote` — Cloud/Remote API server (PostgreSQL + ElectricSQL)
  - `db` — SQLx models and migrations (SQLite)
  - `api-types` — Shared API types for local + remote
  - `executors` — Agent execution engine, profiles, MCP integration
  - `services` — Business logic layer
  - `git` — Git operations (commits, branches, diffs)
  - `git-host` — Git hosting provider API integration (GitHub, GitLab)
  - `mcp` — Model Context Protocol client implementation
  - `review` — PR code review tool
  - `deployment` — Cloud deployment utilities
  - `local-deployment` — Local deployment helpers
  - `relay-tunnel` — Secure relay tunnel connections
  - `relay-control` — Relay control plane for tunneling
  - `server-info` — Server information and health utilities
  - `trusted-key-auth` — Ed25519-based authentication
  - `workspace-manager` — Workspace lifecycle management
  - `worktree-manager` — Git worktree management
  - `utils` — Shared utilities (logging, config, helpers)
- `packages/local-web/`: Local React + TypeScript app entrypoint (Vite, Tailwind). Shell source in `packages/local-web/src`.
- `packages/remote-web/`: Remote deployment frontend entrypoint.
- `packages/web-core/`: Shared React + TypeScript frontend library used by local + remote web (`packages/web-core/src`).
- `packages/ui/`: UI primitives library (shadcn/ui components, Tailwind utilities).
- `packages/public/`: Static assets (logos, icons, images).
- `shared/`: Generated TypeScript types (`shared/types.ts`, `shared/remote-types.ts`) and agent tool schemas (`shared/schemas/`). Do not edit generated files directly.
- `assets/`, `dev_assets_seed/`, `dev_assets/`: Packaged and local dev assets.
- `npx-cli/`: Files published to the npm CLI package.
- `scripts/`: Dev helpers (ports, DB preparation).
- `docs/`: Documentation files.

### Crate-specific guides
- [`crates/remote/AGENTS.md`](crates/remote/AGENTS.md) — Remote server architecture, ElectricSQL integration, mutation patterns, environment variables.
- [`docs/AGENTS.md`](docs/AGENTS.md) — Mintlify documentation writing guidelines and component reference.
- [`packages/local-web/AGENTS.md`](packages/local-web/AGENTS.md) — Web app design system styling guidelines.

## Managing Shared Types Between Rust and TypeScript

ts-rs allows you to derive TypeScript types from Rust structs/enums. By annotating your Rust types with #[derive(TS)] and related macros, ts-rs will generate .ts declaration files for those types.
When making changes to the types, you can regenerate them using `pnpm run generate-types`
Do not manually edit shared/types.ts, instead edit crates/server/src/bin/generate_types.rs

For remote/cloud types, regenerate using `pnpm run remote:generate-types`
Do not manually edit shared/remote-types.ts, instead edit crates/remote/src/bin/generate_types.rs (see crates/remote/AGENTS.md for details).

## Build, Test, and Development Commands
- Install: `pnpm i`
- Run dev (web app + backend with ports auto-assigned): `pnpm run dev`
- Run dev with QA features: `pnpm run dev:qa`
- Backend (watch): `pnpm run backend:dev:watch`
- Web app (dev): `pnpm run local-web:dev`
- Type checks: `pnpm run check` (workspace — local-web, web-core, ui) and `pnpm run backend:check` (Rust cargo check)
- Rust tests: `cargo test --workspace`
- Generate TS types from Rust: `pnpm run generate-types` (or `generate-types:check` in CI)
- Prepare SQLx (offline): `pnpm run prepare-db`
- Prepare SQLx (remote package, postgres): `pnpm run remote:prepare-db`
- Local NPX build: `pnpm run build:npx` then `pnpm pack` in `npx-cli/`
- Format code: `pnpm run format` (runs `cargo fmt` + web-core/local-web/remote-web Prettier)
- Lint: `pnpm run lint` (runs local-web ESLint + ui ESLint + `cargo clippy` + i18n key check)

## Before Completing a Task
- Run `pnpm run format` to format all Rust and web code.

## Coding Style & Naming Conventions
- Rust: `rustfmt` enforced (`rustfmt.toml`); group imports by crate; snake_case modules, PascalCase types.
- TypeScript/React: ESLint + Prettier (2 spaces, single quotes, 80 cols). PascalCase components, camelCase vars/functions, kebab-case file names where practical.
- Keep functions small, add `Debug`/`Serialize`/`Deserialize` where useful.

## Testing Guidelines
- Rust: prefer unit tests alongside code (`#[cfg(test)]`), run `cargo test --workspace`. Add tests for new logic and edge cases.
- Web app: ensure `pnpm run check` and `pnpm run lint` pass. If adding runtime logic, include lightweight tests (e.g., Vitest) in the same directory.

## Security & Config Tips
- Use `.env` for local overrides; never commit secrets. Key envs: `FRONTEND_PORT`, `BACKEND_PORT`, `HOST` 
- Dev ports and assets are managed by `scripts/setup-dev-environment.js`.


