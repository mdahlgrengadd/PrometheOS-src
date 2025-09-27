# Architecture & Innovation Review

## Summary
PromethOS combines a plugin‑driven React desktop with a dual‑channel agent bridge (ergonomic Comlink and standards‑compliant MCP/JSON‑RPC) running across a modular worker orchestration layer. This design cleanly separates UI actions, interop bridges, and heavy runtimes (Pyodide, WebLLM, MCP server) while keeping a single source of truth for actions and docs via the API registry and OpenAPI generation.

## Strengths & Innovations
- Dual bridge (Comlink + MCP) lets humans and AI call the same UI actions without duplicate wiring; MCP tools are auto‑registered from component actions.
- Worker plugin architecture isolates heavy runtimes with a typed, ergonomic client (`WorkerPluginManagerClient`) and a simple worker host (`pluginWorker`).
- Python parity: Pyodide exposes the same desktop API via Comlink plus a strict JSON‑RPC layer for agents.
- OpenAPI generated from live components ensures docs match executable behavior.
- Shadow FS plugin stabilizes asset paths across dev/prod via Vite `base`, easing static asset and worker delivery.

## Architecture Overview
- UI + Plugin Shell: `src/api/context/ApiContext.tsx` registers components, action handlers, events, and bootstraps the bridges/workers.
- API System: Contracts and execution in `src/api/core/types.ts`, `ApiContext`, with OpenAPI emitted by `src/api/utils/openapi.ts`.
- Bridges: `src/api/bridges/HybridDesktopApiBridge.ts` exposes `desktop_api_bridge` and MCP handler globally and over Comlink.
- Workers: Host at `src/worker/pluginWorker.ts`; client at `src/plugins/WorkerPluginManagerClient.ts` (Comlink channel, MCP init, stream proxying).
- Python Runtime: `src/worker/plugins/pyodide/*` (init, bridge injection, MCP forwarding, Comlink proxy setup).
- MCP Server: `src/worker/plugins/mcp-server.ts` implements tools/list, tools/call, and tool registry (dedupe per component).
- Federated Remotes: `packages/shared-api-client` validates params, executes actions via host bridge, and forwards MCP messages.

## MCP & Tooling
- UI `IApiComponent.actions` are transformed into MCP tools automatically on init; duplicates are prevented by component ID.
- JSON‑RPC endpoints supported include `tools/list` and `tools/call`, returning structured results consumable by LLMs and the WebLLM flow.

## Gaps & Risks
- Pyodide CDN hard‑coded: `core.ts` fetches `https://cdn.jsdelivr.net/pyodide/...`; offline or pinned‑version deployments require code edits.
- Global surface mismatch: `globalThis.desktop` exposes only `{ api }` while Python uses `desktop.mcp/events/comlink`; TS callers reach into internal globals.
- OpenAPI drift: checked‑in `openapi.json` can lag the runtime spec; no enforced regeneration in CI.
- Dynamic worker imports: external URLs are allowed; add origin allowlist/signatures to reduce supply‑chain risk.
- Stream portability: transferring `ReadableStream` via Comlink can vary by browser—ensure fallbacks/testing.

## Recommendations
- Configuration: Move Pyodide and worker module URLs to env/manifest; support mirrored/offline asset hosting and version pinning.
- API Parity: Standardize `globalThis.desktop` to expose `{ api, mcp, events }` to align TS, Python, and agent usage.
- OpenAPI Pipeline: Add `npm run codegen` + CI check to regenerate spec/client and fail on drift.
- Security: Introduce plugin origin allowlist and optional signature verification before dynamic import; consider capability flags per plugin.
- Observability: Instrument bridge calls, worker routing, and MCP execution with structured logs and error taxonomy.
- Reliability: Expand integration tests for Comlink handshake, MCP tools/list/call, and cross‑worker action dispatch.
- Performance: Cache tool registry and OpenAPI generation; verify stream transfer behavior and polyfill if needed.

## Overall
The system shows thoughtful decoupling, strong agent interop, and a coherent worker/plugin model, well‑suited for AI‑augmented desktop workflows. Tightening configuration, security, and build automation would raise it from robust to production‑grade.

## Next Steps (Checklist)
- [ ] Externalize Pyodide/worker URLs; add offline mirror.
- [ ] Expose `{ api, mcp, events }` on `globalThis.desktop` and update docs.
- [ ] Wire `openapi.json` regeneration to CI; regenerate client.
- [ ] Add plugin allowlist/signing and capability flags.
- [ ] Add e2e tests for Comlink/MCP flows and stream handling.
