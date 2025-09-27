# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **PrometheOS**, a sophisticated browser-based desktop environment that has undergone a major architectural transformation to a **Webpack 5 Module Federation microfrontend architecture**. It's a virtual operating system that runs in the browser with full desktop environment, window management, and multiple integrated applications.

## Architecture

### Module Federation Structure
The project uses a microfrontend architecture where the host application orchestrates remote applications:

- **Host Application** (`apps/desktop-host/`) - Desktop shell core running on port 3011
- **Remote Applications** (`apps/notepad-remote/`, etc.) - Independent microfrontends on separate ports
- **Shared Libraries** (`packages/shared-*`) - Common functionality and singletons
- **Legacy System** (`src/`) - Original Vite-based implementation (preserved for compatibility)

### Key Directories
- `apps/desktop-host/src/api/` - 7-layer API bridge system for host-remote communication
- `apps/desktop-host/src/shell/` - Window management and remote registry
- `packages/shared-api-client/` - API client for remote applications
- `packages/shared-ui-kit/` - Consolidated UI components (Radix UI + Tailwind)
- `packages/shared-react/` - React singletons for Module Federation

## Development Commands

### Primary Development
```bash
# Start all Module Federation services (host + remotes)
npm run dev

# Start individual services
npm run dev:host              # Desktop host only (port 3011)
npm run dev:notepad           # Notepad remote only (port 3001)
npm run dev:ui-kit            # Shared UI kit only (port 3003)

# Legacy development
npm run dev:legacy            # Original Vite system

# Utilities
npm run stop                  # Kill all dev servers
npm run test:services         # Check service health
```

### Build and Testing
```bash
# Build Module Federation system
npm run build:all

# Build legacy system
npm run build:legacy

# Run tests
npm test

# Lint and type check
npm run lint
npm run typecheck
```

## API Integration System

The project features a sophisticated **dual-pattern API system**:

### For Remote Applications
Use the shared API client to communicate with the host:
```typescript
import { useApiClient } from '@shared/api-client';

const Component = () => {
  const apiClient = useApiClient();
  // Access host APIs through the client
};
```

### Host API Bridge
The host exposes a global API bridge at `window.__HOST_API_BRIDGE__` that provides:
- File system operations
- Window management
- Theme system access
- Worker communication

### MCP Protocol Integration
The system includes full JSON-RPC 2.0 compliance for AI agent integration with automatic component registration as MCP tools.

## Module Federation Specifics

### Remote Development
- Each remote application runs on its own port (3001, 3002, etc.)
- Remote entry points are served at `/remoteEntry.js`
- Shared dependencies (React, ReactDOM) are configured as singletons
- Cross-remote communication happens through the API bridge

### Configuration
- Browser-compatible configuration system (no `process.env` in browser code)
- Environment detection through webpack DefinePlugin
- Module Federation containers provide application isolation

## Theme System

Multi-theme support with sophisticated theming:
- **BeOS** - Primary theme with desktop tab bar
- **Windows 98/XP** - Classic Windows aesthetics
- **macOS** - Modern macOS-inspired design
- Themes are located in `public/themes/` and `packages/shared-ui-kit/src/lib/`

## Worker System

Complex worker communication patterns using Comlink:
- **Pyodide Workers** - Python runtime in web workers (`src/worker/plugins/pyodide/`)
- **MCP Workers** - AI agent protocol handling
- **Plugin Workers** - Isolated execution environments

## Special Considerations

### Working with Host Application
- Window operations use Zustand store (`apps/desktop-host/src/store/`)
- API bridge handles all cross-remote communication
- Worker management for Python/AI integrations

### Working with Remote Applications
- Each remote is independently deployable
- Must use shared singletons for React ecosystem dependencies
- Follow established component patterns from shared-ui-kit
- Communicate with host exclusively through API client

### Legacy System
- Original plugin system preserved in `src/plugins/`
- Plugin manifests define application metadata in `manifest.tsx` files
- Dynamic loading through `src/plugins/registry.tsx`

## Performance Notes

- Target bundle size reduction from 50MB to 15MB + distributed remotes
- Lazy loading of remote applications
- Code splitting by application domain
- Shared singleton management to prevent duplication

## Configuration Files

Key configuration files to understand:
- `apps/desktop-host/webpack.config.js` - Module Federation host setup
- `apps/*/webpack.config.js` - Remote application configurations
- `packages/*/webpack.config.js` - Shared library builds
- `vite.config.ts` - Legacy system configuration