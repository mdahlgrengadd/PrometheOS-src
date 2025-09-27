# Repository Guidelines

## Project Structure & Module Organization
- Module Federation is the primary architecture. Host lives in `apps/desktop-host/`; remotes live under `apps/*-remote/` (e.g., `apps/notepad-remote/`).
- Shared libraries live in `packages/` (e.g., `shared-api-client`, `shared-ui-kit`). Legacy Vite system remains in `src/` (API bridge, workers, components) and is still used by the host.
- Assets are under `public/`; builds emit to `dist/`. Scripts in `scripts/` handle worker bundling (`build-workers.cjs`) and shadow FS setup—use via npm scripts.

## Build, Test, and Development Commands
- **All Services**: `npm run dev` (starts host, notepad, and UI kit simultaneously)
- **Individual Services**: `npm run dev:host`, `npm run dev:notepad`, `npm run dev:ui-kit`
- **Stop All Services**: `npm run stop` (kills all processes on ports 3000-3099)
- **Test Services**: `npm run test:services` (checks if all services are running)
- Host (apps/desktop-host): `npm run dev` (http://localhost:3011), `npm run build`, `npm run build:workers`.
- Remote example (apps/notepad-remote): `npm run start` (http://localhost:3001), `npm run build`.
- Shared UI Kit (packages/shared-ui-kit): `npm run start` (http://localhost:3003), `npm run build`.
- Legacy root (Vite): `npm run dev:legacy`, `npm run build`, `npm run preview`, `npm run build:workers`, `npm run lint`, `npm run test`, `npm run test:watch`.
- **Tip**: Use `npm run dev` from project root for full development environment.

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

## Environment Configuration
- **Browser-Compatible**: Uses TypeScript constants instead of `process.env` in browser code
- **Configuration File**: `apps/desktop-host/src/config/environment.ts` - Central configuration management
- **Build-Time Variables**: Webpack configs support Node.js environment variables for build-time configuration
- **Multi-Environment**: Built-in support for development, staging, and production environments
- **URL Configuration**: All Module Federation URLs are configurable via environment constants
- **Documentation**: See `CONFIG_GUIDE.md` and `DEV_WORKFLOW.md` for detailed setup instructions

## API System Status (2025-09-27)
- ✅ **Infinite Re-render Loop**: Fixed circular dependency in component registration
- ✅ **React Context Pattern**: Stable API client provider implementation
- ✅ **Registration Stability**: Components register once and remain stable
- ✅ **Performance**: Eliminated unnecessary API client churning
