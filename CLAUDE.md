# Claude Code Guidelines

> This file provides guidance for Claude Code when working in this repository.
> For detailed project structure and conventions, see [AGENTS.md](AGENTS.md).

## Quick Reference

### Essential Commands
```bash
pnpm i                    # Install dependencies
pnpm run dev              # Start dev (frontend + backend)
pnpm run format           # Format all code before committing
pnpm run check            # Type check workspace
cargo test --workspace    # Run Rust tests
```

### Type Generation
- **Local types**: `pnpm run generate-types` → edits `shared/types.ts`
- **Remote types**: `pnpm run remote:generate-types` → edits `shared/remote-types.ts`
- Never manually edit generated files in `shared/`

### Key Directories
| Path | Purpose |
|------|---------|
| `crates/server/` | Local API server |
| `crates/remote/` | Cloud API server |
| `packages/web-core/` | Shared React components |
| `packages/local-web/` | Local app entry |
| `packages/remote-web/` | Cloud app entry |

### Before Completing Tasks
1. Run `pnpm run format`
2. Verify `pnpm run check` passes
3. For Rust changes: `cargo test --workspace`

See [AGENTS.md](AGENTS.md) for complete documentation.