# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL AWARENESS: SOPHISTICATED SYSTEM

This is an **enterprise-grade, multi-language integration platform** disguised as a desktop environment. Before making changes, understand you're working with:
- **7-layer integration architecture** rivaling enterprise message buses
- **Triple-interface API system** (TypeScript SDK, Python bindings, MCP JSON-RPC 2.0)
- **Production-grade MCP protocol implementation** for AI agent integration
- **Complex worker communication patterns** with Comlink and custom bridges
- **Significant security vulnerabilities** requiring careful handling

**Overall Complexity: Very High** | **Innovation Level: Exceptional** | **Security Risk: High**

## 🔥 MODULE FEDERATION ARCHITECTURE UPDATE (2025-09-27)

**MAJOR ARCHITECTURAL TRANSFORMATION COMPLETED:**
The system has been successfully refactored from a Vite-based plugin system to **Webpack 5 Module Federation microfrontend architecture**. This preserves the sophisticated 7-layer integration while achieving better performance, security, and maintainability.

**New Development Structure:**
```
📁 apps/
├── 📁 desktop-host/          # Host application (port 3011)
├── 📁 notepad-remote/       # First remote (port 3001)
└── 📁 packages/             # Shared libraries
    ├── 📁 shared-ui-kit/    # Shared UI components (port 3003)
    ├── 📁 shared-api-client/
    └── 📁 shared-themes/
```

## Development Commands

**🚀 QUICK START - All Services:**
- `npm run dev` - Start all services simultaneously (host, notepad, UI kit)
- `npm run stop` - Kill all development servers (ports 3000-3099)
- `npm run test:services` - Check if all services are running

**Individual Services:**
- `npm run dev:host` - Start host application at localhost:3011
- `npm run dev:notepad` - Start notepad remote at localhost:3001
- `npm run dev:ui-kit` - Start shared UI kit at localhost:3003

**Host Application (`apps/desktop-host/`):**
- `npm run dev` - Start host application at localhost:3011
- `npm run build` - Production build of host
- `npm run type-check` - TypeScript validation

**Remote Applications (e.g., `apps/notepad-remote/`):**
- `npm run start` - Start remote at localhost:3001
- `npm run build` - Production build of remote
- `npm run type-check` - TypeScript validation

**Shared Packages (e.g., `packages/shared-ui-kit/`):**
- `npm run start` - Start shared package at localhost:3003
- `npm run build` - Production build of shared package

**Legacy Commands (Original System):**
- `npm run dev` - Start development server with worker building
- `npm run build` - Full production build (builds workers, compiles TypeScript, builds Vite, sets up shadow FS, fixes symlinks)
- `npm run build:workers` - Build web workers only
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run preview` - Preview production build

## System Architecture Overview

**CURRENT ARCHITECTURE:** **Module Federation Microfrontend Architecture** with preserved **7-layer integration stack**:

**Module Federation Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│                      HOST APPLICATION                      │
│                   (Desktop Shell Core)                     │
│  ✅ Window Management, API Bridge, MCP Server, Themes     │
├─────────────────────────────────────────────────────────────┤
│                   REMOTE APPLICATIONS                      │
│ notepad@localhost:3001 │ calculator@localhost:3002         │
│ browser@localhost:3003 │ file-explorer@localhost:3004      │
└─────────────────────────────────────────────────────────────┘
```

**Preserved 7-Layer Integration:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT INTERFACES (TypeScript SDK, Python, MCP JSON-RPC) │
├─────────────────────────────────────────────────────────────┤
│ 2. PROTOCOL LAYER (Comlink Bridge, PostMessage, Workers)    │
├─────────────────────────────────────────────────────────────┤
│ 3. API ABSTRACTION (HybridDesktopApiBridge, MCPHandler)     │
├─────────────────────────────────────────────────────────────┤
│ 4. SERVICE REGISTRY (ApiContext, Component Registration)    │
├─────────────────────────────────────────────────────────────┤
│ 5. EXECUTION LAYER (Action Handlers, Event Bus, State)      │
├─────────────────────────────────────────────────────────────┤
│ 6. WORKER RUNTIME (Pyodide, MCP Server, Plugin Workers)     │
├─────────────────────────────────────────────────────────────┤
│ 7. SYSTEM LAYER (Window Management, Plugins, Themes)        │
└─────────────────────────────────────────────────────────────┘
```

## 🚨 CRITICAL INTEGRATION ARCHITECTURE

### Triple Interface Pattern (UNIQUE INNOVATION)
This system provides **three distinct interfaces** for the same functionality:

1. **TypeScript PrometheOS Client** - Type-safe, auto-generated SDK
2. **Python Comlink Bridge** - Ergonomic Python bindings via Pyodide
3. **MCP JSON-RPC 2.0** - Standardized AI agent protocol compliance

**Key Files:**
- `src/api/bridges/HybridDesktopApiBridge.ts` - Main integration bridge
- `src/worker/plugins/mcp-server.ts` - Production-grade MCP server (677 lines)
- `src/api/context/ApiContext.tsx` - Component registration system (551 lines)

### API Component System
**Dynamic Registration Pattern:**
```typescript
// Components auto-register as both TypeScript APIs and MCP tools
const component: IApiComponent = {
  id: "sys", type: "System", name: "Desktop System Services",
  actions: [{ id: "open", name: "Launch App", parameters: [...] }]
};
apiContext.registerComponent(component); // Auto-becomes MCP tool
```

### Window Management System
- **Zustand Store**: `src/store/windowStore.ts` - High-performance state management
- **Window Types**: `src/types/window.ts` - Comprehensive TypeScript interfaces
- **Persistence**: State survives page reloads via localStorage
- **BeOS Theme Support**: Special maximized window handling with desktop tab bar

Key Actions: `registerWindow()`, `focus()`, `move()`, `resize()`, `minimize()`, `maximize()`, `close()`

### Plugin System Architecture
- **Static Registry**: `src/plugins/registry.tsx` - Bundled plugins
- **Dynamic Loading**: `src/plugins/dynamicRegistry.ts` - Runtime plugin installation
- **Worker Integration**: Comlink-based communication for CPU-intensive operations
- **Manifest System**: Rich metadata with icon, description, and worker support

**Plugin Structure:**
```
src/plugins/apps/[name]/
├── manifest.tsx    # Plugin metadata and configuration
├── index.tsx       # Main plugin entry point
├── ui.tsx         # Plugin UI components (optional)
└── worker.ts      # Web worker for background processing (optional)
```

### Worker Communication Patterns
- **Comlink Proxies**: Type-safe remote function calls across worker boundaries
- **Message Correlation**: Request/response matching with 30-second timeouts
- **Python-JavaScript Bridge**: Seamless cross-language execution via Pyodide
- **MCP Tool Execution**: Main thread API calls from worker MCP server

## 🔴 CRITICAL SECURITY VULNERABILITIES

**IMMEDIATE ATTENTION REQUIRED:**

1. **Dynamic Code Execution** (`@vite-ignore` bypasses security checks)
2. **MCP Parameter Injection** (Unvalidated tool parameters)
3. **Python Sandbox Escape** (Direct JavaScript object injection)
4. **Global Namespace Pollution** (Multiple global object attachments)

**Before modifying security-sensitive code, implement input validation and sandboxing.**

## ⚡ PERFORMANCE CRITICAL ISSUES

**Bundle Size: ~50MB** (Excessive for web application)
- Monaco Editor: 6MB
- Three.js dependencies: Always bundled even when unused
- 7200+ modules indicating over-componentization

**Optimization Priorities:**
1. Code-split Monaco Editor and Three.js as optional chunks
2. Implement proper lazy loading for plugins
3. Consolidate duplicate UI component libraries (ShadCN + Franky + Windows themes)

## 🎨 UI Component Architecture

**THREE UI SYSTEMS** (Architectural debt):
- `src/components/ui/` - ShadCN/UI components (primary)
- `src/components/franky-ui-kit/` - Windows-style components
- `src/components/shelley-wm/` - Window management UI

**Theme System:**
- `src/lib/ThemeProvider.tsx` - Comprehensive theme management (619 lines)
- Support for BeOS, Windows, macOS, and custom themes
- Dynamic CSS variable injection and theme loading

## 🔧 Build System Architecture

**Multi-Stage Build Pipeline:**
```bash
npm run build → build-workers → TypeScript → Vite → shadow-fs → symlink-fix
```

**Custom Vite Plugins:**
- `vite.shadowfs.ts` - Virtual file system for browser-based file operations
- Shadow FS serves both development and production virtual file systems
- Worker pre-compilation via `scripts/build-workers.cjs`

## 🐍 Python Integration (Pyodide)

**Python Runtime Features:**
- Full Python 3.11 via Pyodide in web workers
- Desktop API access from Python: `await desktop.api.execute("sys", "open", {"name": "notepad"})`
- MCP protocol support: `await desktop.mcp.send(jsonrpc_message)`
- Comlink integration for ergonomic cross-language calls

**Key Files:**
- `src/worker/plugins/pyodide/bridge.ts` - Python-JavaScript bridge setup
- `src/worker/plugins/pyodide/python/mcp_protocol.py` - Python MCP client

## 📋 DEVELOPMENT GUIDELINES

### When Working with APIs
- **Always validate MCP tool parameters** before execution
- **Use ApiContext for component registration** - automatic MCP tool creation
- **Prefer event bus** (`eventBus.emit()`) for loose coupling over direct calls
- **Test both TypeScript and Python interfaces** when modifying API components

### When Working with Plugins
- **Use plugin manifests** for metadata rather than hardcoding
- **Implement proper cleanup** in plugin `unload()` methods
- **Consider worker communication** for CPU-intensive operations
- **Test dynamic plugin loading/unloading** cycles

### When Working with Windows
- **All window operations through Zustand store** - never manipulate DOM directly
- **BeOS theme requires special handling** for maximized windows
- **Window state persistence** happens automatically via localStorage

### When Working with Themes
- **Use CSS variables** defined in theme configs rather than hardcoded styles
- **Test theme switching** to ensure proper cleanup of previous theme resources
- **BeOS theme has unique desktop tab bar** requiring special window positioning

## 🔍 CRITICAL FILES TO UNDERSTAND

**Integration Layer:**
- `src/api/bridges/HybridDesktopApiBridge.ts` - Core integration bridge
- `src/api/context/ApiContext.tsx` - API component registration system
- `src/worker/plugins/mcp-server.ts` - MCP protocol server implementation

**System Core:**
- `src/store/windowStore.ts` - Window state management
- `src/plugins/PluginContext.tsx` - Plugin system coordination
- `src/lib/ThemeProvider.tsx` - Theme management system

**Build System:**
- `vite.shadowfs.ts` - Virtual file system plugin
- `scripts/build-workers.cjs` - Worker pre-compilation

## 📚 ARCHITECTURAL PATTERNS USED

**Successfully Implemented:**
- Bridge Pattern (Multi-protocol API bridges)
- Observer Pattern (Event bus for loose coupling)
- Registry Pattern (Dynamic component registration)
- Proxy Pattern (Comlink worker proxies)
- Factory Pattern (Component and action creation)

**Missing Enterprise Patterns:**
- Circuit Breaker (No fault tolerance for failing services)
- Bulkhead (No resource isolation between components)
- Saga Pattern (No distributed transaction management)

## 🎯 RECOMMENDED FOCUS AREAS

**Immediate (Critical):**
1. **Implement security hardening** for dynamic code execution
2. **Add input validation** for all MCP tool parameters
3. **Optimize bundle size** through better code splitting

**Medium-term (Important):**
1. **Consolidate UI component libraries** to single system
2. **Complete code generation pipeline** for TypeScript SDK
3. **Add comprehensive error boundaries** and circuit breakers

**Long-term (Strategic):**
1. **Extract integration layer** as standalone platform
2. **Implement proper plugin sandboxing** with resource quotas
3. **Add distributed tracing** for multi-worker operations

---

## 🚀 MODULE FEDERATION IMPLEMENTATION DETAILS

### Host Application (`apps/desktop-host/`)

**Core Components:**
- `src/DesktopHost.tsx` - Main host application with provider hierarchy
- `src/shell/RemoteRegistry.tsx` - Manages Module Federation remote loading
- `src/shell/RemoteWindowRenderer.tsx` - Renders remotes in windows
- `src/core/DesktopBootstrap.tsx` - Initializes desktop applications
- `webpack.config.js` - Module Federation host configuration

**Key Features:**
- **Remote Loading**: Dynamic import of federated remotes via `import('notepad/App')`
- **Window Integration**: Remotes render within existing window management system
- **API Bridge**: Preserved sophisticated integration for remote communication
- **Shared Singletons**: React, ReactDOM shared across host and remotes

### Remote Applications (e.g., `apps/notepad-remote/`)

**Structure:**
- `src/App.tsx` - Main remote component (exposed as `./App`)
- `src/index.ts` - Remote bootstrap for standalone development
- `webpack.config.js` - Module Federation remote configuration
- `package.json` - Independent dependency management

**Federation Configuration:**
```javascript
// Remote exposes App component
exposes: {
  './App': './src/App.tsx'
}

// Shared dependencies with host
shared: {
  'react': { singleton: true },
  'react-dom': { singleton: true }
}
```

### Development Workflow

**Starting Full Environment:**

**Option 1: Single Command (Recommended):**
```bash
# From project root - starts all services simultaneously
npm run dev

# Access: http://localhost:3011 (host loads remotes dynamically)
```

**Option 2: Individual Services:**
```bash
# Terminal 1: Start host application
cd apps/desktop-host && npm run dev

# Terminal 2: Start notepad remote
cd apps/notepad-remote && npm run start

# Terminal 3: Start shared UI kit
cd packages/shared-ui-kit && npm run start

# Access: http://localhost:3011 (host loads remotes dynamically)
```

**Stopping All Services:**
```bash
# Kill all development servers (ports 3000-3099)
npm run stop
```

**Module Federation URLs:**
- Host: `http://localhost:3011`
- Notepad Remote Entry: `http://localhost:3001/remoteEntry.js`
- Shared UI Kit Remote Entry: `http://localhost:3003/remoteEntry.js`
- Calculator Remote Entry: `http://localhost:3002/remoteEntry.js` (planned)

**Environment Configuration:**
- **Browser-Compatible**: No `process.env` usage in browser code
- **Configuration File**: `apps/desktop-host/src/config/environment.ts`
- **Build-Time Variables**: Webpack supports Node.js environment variables
- **Multi-Environment**: Development, staging, production configurations
- **Documentation**: `CONFIG_GUIDE.md`, `DEV_WORKFLOW.md`, `README_DEV.md`

### Integration with Legacy Systems

**Preserved Components:**
- **Window Store**: Zustand-based window management intact
- **API Context**: Component registration system maintained
- **Theme System**: All themes (BeOS, Windows, macOS) preserved
- **Worker Communication**: Comlink patterns ready for federation

**Migration Status:**
- ✅ **Foundation**: Webpack 5 Module Federation operational
- ✅ **Host Application**: Core functionality ported and enhanced
- ✅ **First Remote**: Notepad application successfully federated
- 🔄 **Shared Libraries**: Mock implementations, full federation pending
- 📋 **Additional Remotes**: Calculator, file explorer, other apps planned

---

**This system represents exceptional engineering sophistication that pushes the boundaries of browser-based application architecture. The Module Federation implementation maintains this sophistication while achieving better separation of concerns, independent deployability, and enhanced security. Handle with appropriate respect for its complexity and potential.**