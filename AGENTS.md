# Repository Guidelines

## Project Structure & Module Organization
- Module Federation is the primary architecture. Host lives in `apps/desktop-host/`; remotes live under `apps/*-remote/` (e.g., `apps/notepad-remote/`).
- Shared libraries live in `packages/` (e.g., `shared-api-client`, `shared-ui-kit`). Legacy Vite system remains in `src/` (API bridge, workers, components) and is still used by the host.
- Assets are under `public/`; builds emit to `dist/`. Scripts in `scripts/` handle worker bundling (`build-workers.cjs`) and shadow FS setup—use via npm scripts.

## Build, Test, and Development Commands
- Host (apps/desktop-host): `npm run dev` (http://localhost:3000), `npm run build`, `npm run build:workers`.
- Remote example (apps/notepad-remote): `npm run start` (http://localhost:3001), `npm run build`.
- Legacy root (Vite): `npm run dev`, `npm run build`, `npm run preview`, `npm run build:workers`, `npm run lint`, `npm run test`, `npm run test:watch`.
- Tip: run host and remotes in separate terminals during development.

## Coding Style & Naming Conventions
- TypeScript + React 18; 2‑space indentation; functional components and hooks.
- Names: components/stores/providers `PascalCase`; hooks/utils `camelCase`. Use Tailwind and CSS modules where applicable.
- Legacy imports use `@/` alias for `src/`. In MF, ensure React/ReactDOM are singletons; avoid `@vite-ignore` dynamic imports.
- Lint before commit: `npm run lint` (auto-fix with `-- --fix`).

## Testing Guidelines
- Legacy tests use Vitest at repo root. Place tests in `src/tests/` or next to modules as `*.test.ts[x]`.
- Host/remotes currently rely on type checks (`npm run type-check` if present). Add tests near features as they stabilize.
- Mock workers/DOM‑heavy APIs; mirror filenames and describe user‑facing behavior.

## Commit & Pull Request Guidelines
- Use conventional commits (`feat:`, `fix:`, `chore:`, `style:`). Keep subjects imperative, ≤72 chars; link issues when relevant.
- PRs: include intent, user‑visible changes, and screenshots/GIFs for UI. Call out host vs remote changes explicitly.
- Verify builds locally: host and all changed remotes (`apps/*-remote`) and run root lint/tests before requesting review.

## Security & Configuration Tips
- Validate MCP/tool parameters; prefer the Host API bridge over ad‑hoc messaging.
- Restrict remote/plugin origins in config; avoid insecure dynamic code execution.
- For Pyodide and workers, prefer configurable/base‑URL hosting rather than hard‑coded CDNs.
