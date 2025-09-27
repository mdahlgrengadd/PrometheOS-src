# API Migration Plan: Legacy to Module Federation Architecture

## Overview

This document outlines the comprehensive migration strategy for transitioning from the legacy API system (`src/api/`) to the new Module Federation architecture. The migration aims to preserve all existing functionality while establishing a more scalable, maintainable, and federated API system.

## Current State Analysis

### Legacy API System (`src/api/`)
- **Size**: ~2,600 lines of sophisticated API integration code
- **Key Components**:
  - `ApiContext.tsx` - React context provider
  - `withApi.tsx` - Higher-order component wrapper
  - `useApi.ts` - React hooks for API access
  - `registerSystemApi.ts` - System API registration
  - Bridge implementations for desktop/hybrid patterns
- **Features**: Advanced MCP protocol, worker communication, event systems
- **Dependencies**: Deeply integrated with 20+ legacy plugins

### New MF API System (`apps/desktop-host/src/api/`)
- **Architecture**: Dual-pattern system (React Context + Bridge patterns)
- **Components**:
  - `ApiClientProvider.tsx` - Federated context provider
  - `ApiProvider.tsx` - Core API provider
  - `HostApiBridge.tsx` - Bridge for non-React remotes
- **Status**: ~30% migration complete, infrastructure solid

### Shared API Client (`packages/shared-api-client/`)
- **Components**: Hooks, types, validation, API client
- **Status**: Functional but missing legacy feature parity
- **Usage**: Working in notepad-remote, ready for broader adoption

## Critical Issues

### 1. Dual Provider Conflict
**Problem**: Both legacy (`src/api/ApiContext.tsx`) and new (`apps/desktop-host/src/api/ApiProvider.tsx`) providers are active simultaneously, causing:
- Memory overhead from duplicate context trees
- Potential state synchronization issues
- Confusion about which API system is being used

### 2. Type System Fragmentation
**Problem**: Breaking changes between legacy and new type definitions:
- `src/api/core/types.ts` vs `apps/desktop-host/src/types/api.ts`
- Incompatible method signatures
- Missing type definitions for advanced features

### 3. Incomplete Bridge Implementation
**Problem**: Federated API client missing critical legacy functionality:
- MCP protocol methods
- Advanced worker communication
- Event system integration
- File system operations

### 4. Legacy Plugin Dependencies
**Problem**: 20+ plugins in `src/plugins/apps/` still using legacy API patterns:
- Direct imports from `src/api/`
- Legacy hook usage patterns
- Incompatible with Module Federation isolation

## Migration Strategy

## Phase 1: Foundation Stabilization (Immediate - Week 1-2)

### 1.1 Resolve Provider Conflicts
**Objective**: Eliminate dual provider issues and establish clear API boundaries

**Tasks**:
```typescript
// 1. Create unified API provider factory
// File: apps/desktop-host/src/api/UnifiedApiProvider.tsx
export const createUnifiedApiProvider = (mode: 'legacy' | 'federated') => {
  if (mode === 'legacy') {
    return LegacyApiProvider;
  }
  return FederatedApiProvider;
};

// 2. Add environment detection
// File: apps/desktop-host/src/config/environment.ts
export const API_MODE = process.env.NODE_ENV === 'development'
  ? 'federated'
  : 'legacy'; // Gradual rollout
```

**Implementation Steps**:
1. Create feature flag system for API mode switching
2. Implement provider selection logic in `DesktopBootstrap.tsx`
3. Add runtime detection of which provider is active
4. Create migration utilities to gradually switch plugins

### 1.2 Unify Type Systems
**Objective**: Create backward-compatible type definitions that work for both systems

**Tasks**:
```typescript
// File: packages/shared-api-client/src/types/unified.ts
export interface UnifiedApiContext extends LegacyApiContext {
  // Bridge legacy and new types
  fileSystem: FileSystemApi;
  windowManager: WindowManagerApi;
  themeSystem: ThemeSystemApi;
  mcpProtocol: McpProtocolApi;
}

// Migration utility types
export type LegacyToFederatedMapping<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (...args: Parameters<T[K]>) => ReturnType<T[K]>
    : T[K];
};
```

**Implementation Steps**:
1. Audit all type differences between systems
2. Create unified type definitions in shared-api-client
3. Generate migration adapters for breaking changes
4. Update existing remotes to use unified types

### 1.3 Extend Shared API Client
**Objective**: Achieve feature parity with legacy API system

**Missing Features to Implement**:
```typescript
// File: packages/shared-api-client/src/features/
├── mcp-protocol/
│   ├── McpClient.ts
│   ├── McpHooks.tsx
│   └── McpTypes.ts
├── worker-communication/
│   ├── WorkerBridge.ts
│   ├── WorkerHooks.tsx
│   └── WorkerTypes.ts
├── event-system/
│   ├── EventBus.ts
│   ├── EventHooks.tsx
│   └── EventTypes.ts
└── advanced-file-system/
    ├── VirtualFS.ts
    ├── FileSystemHooks.tsx
    └── FileSystemTypes.ts
```

## Phase 2: Incremental Plugin Migration (Short-term - Week 3-8)

### 2.1 Migration Priority Matrix
**Criteria**: Complexity (Low/Medium/High) × Dependencies (Few/Many) × Usage (Low/High)

**Priority 1 (Week 3-4): Simple, Low-Dependency Plugins**
- `calculator` - Minimal API usage
- `browser` - Self-contained
- `session` - Limited integration points

**Priority 2 (Week 5-6): Medium Complexity Plugins**
- `notepad` - Already partially migrated
- `file-explorer` - Moderate file system usage
- `settings` - System integration but contained

**Priority 3 (Week 7-8): Complex, High-Dependency Plugins**
- `pyserve` - Heavy worker communication
- `aichat` - Full MCP protocol usage
- `api-explorer` - Advanced API integration
- `blueprints` - Complex workflow system

### 2.2 Migration Template System
**Objective**: Standardize plugin migration process

```typescript
// File: scripts/migrate-plugin.js
const migratePlugin = async (pluginName) => {
  // 1. Analyze current API usage
  const apiUsage = await analyzeApiUsage(`src/plugins/apps/${pluginName}`);

  // 2. Generate federated version
  const federatedPlugin = await generateFederatedPlugin(pluginName, apiUsage);

  // 3. Create migration wrapper
  const migrationWrapper = await createMigrationWrapper(pluginName);

  // 4. Run compatibility tests
  await runCompatibilityTests(pluginName);
};
```

### 2.3 Plugin Migration Process
**For Each Plugin**:
1. **Analysis Phase**:
   - Map all API calls and dependencies
   - Identify worker communication patterns
   - Document state management usage
   - Check for theme system integration

2. **Migration Phase**:
   - Create new federated plugin structure
   - Replace legacy API calls with shared client
   - Update imports and type definitions
   - Implement compatibility layers if needed

3. **Testing Phase**:
   - Unit tests for API integration
   - Integration tests with host application
   - Performance benchmarking
   - User acceptance testing

4. **Deployment Phase**:
   - Feature flag rollout
   - Monitor for regressions
   - Cleanup legacy code paths

## Phase 3: Advanced Feature Migration (Medium-term - Week 9-12)

### 3.1 MCP Protocol Migration
**Objective**: Full MCP protocol support in federated architecture

**Current Legacy Implementation**: `src/api/system/registerSystemApi.ts`
- JSON-RPC 2.0 compliance
- Automatic method registration
- Type validation and error handling

**New Federated Implementation**:
```typescript
// File: packages/shared-api-client/src/mcp/FederatedMcpClient.ts
export class FederatedMcpClient {
  private bridge: HostApiBridge;

  async registerMcpMethod<T>(method: McpMethod<T>): Promise<void> {
    return this.bridge.call('mcp.register', method);
  }

  async callMcpMethod<T>(methodName: string, params: T): Promise<McpResponse> {
    return this.bridge.call('mcp.call', { methodName, params });
  }
}
```

### 3.2 Worker Communication Migration
**Objective**: Seamless worker integration in federated environment

**Challenges**:
- Workers in remotes need host API access
- Comlink bridges across federation boundaries
- Python/Pyodide integration complexity

**Solution**:
```typescript
// File: packages/shared-api-client/src/workers/FederatedWorkerBridge.ts
export class FederatedWorkerBridge {
  constructor(private apiClient: ApiClient) {}

  async createWorker(workerScript: string): Promise<WorkerProxy> {
    // Request host to create worker with API access
    const workerRef = await this.apiClient.call('worker.create', {
      script: workerScript,
      apiAccess: true
    });

    return new WorkerProxy(workerRef, this.apiClient);
  }
}
```

### 3.3 Event System Migration
**Objective**: Distributed event system across federation

**Legacy System**: Central event bus in `src/core/EventBus.ts`
**New System**: Federated event distribution

```typescript
// File: packages/shared-api-client/src/events/FederatedEventBus.ts
export class FederatedEventBus {
  async emit(event: string, data: any): Promise<void> {
    // Events flow through host to all remotes
    return this.apiClient.call('events.emit', { event, data });
  }

  async subscribe(event: string, callback: EventCallback): Promise<UnsubscribeFn> {
    return this.apiClient.subscribe('events.subscribe', { event }, callback);
  }
}
```

## Phase 4: Legacy System Deprecation (Long-term - Week 13-16)

### 4.1 Legacy Code Removal Strategy
**Objective**: Clean removal of legacy API system once migration is complete

**Removal Order**:
1. **Week 13**: Remove unused legacy API components
2. **Week 14**: Update all imports and references
3. **Week 15**: Remove legacy provider from bootstrap
4. **Week 16**: Final cleanup and optimization

### 4.2 Performance Optimization
**Objective**: Optimize federated API system for production

**Optimizations**:
- Bundle size reduction through tree shaking
- API call batching and caching
- Lazy loading of API modules
- Connection pooling for worker communication

### 4.3 Documentation and Training
**Objective**: Ensure team can maintain and extend federated API system

**Deliverables**:
- Updated API documentation
- Migration guide for future plugins
- Best practices for federated development
- Troubleshooting guide

## Migration Scripts and Tooling

### Automated Migration Tools
```bash
# File: scripts/migration-tools.js

# Analyze plugin API usage
npm run analyze:plugin <plugin-name>

# Generate federated plugin template
npm run generate:federated-plugin <plugin-name>

# Test API compatibility
npm run test:api-compatibility <plugin-name>

# Migrate plugin incrementally
npm run migrate:plugin <plugin-name> --dry-run
npm run migrate:plugin <plugin-name> --execute
```

### Validation Scripts
```bash
# Validate migration completeness
npm run validate:migration

# Check for legacy API usage
npm run check:legacy-usage

# Performance benchmarks
npm run benchmark:api-performance
```

## Risk Mitigation

### High-Risk Areas
1. **Worker Communication**: Complex Comlink bridges may break
2. **MCP Protocol**: AI agent integration requires careful testing
3. **State Synchronization**: Distributed state management complexity
4. **Performance**: Federated calls may introduce latency

### Mitigation Strategies
1. **Extensive Testing**: Unit, integration, and e2e tests for each migration
2. **Feature Flags**: Gradual rollout with ability to rollback
3. **Monitoring**: Real-time monitoring of API performance and errors
4. **Backup Plans**: Keep legacy system available during transition

## Success Metrics

### Technical Metrics
- **Bundle Size**: Reduce from 50MB to 15MB + distributed remotes
- **API Response Time**: Maintain <100ms for local API calls
- **Memory Usage**: Reduce by eliminating dual provider overhead
- **Test Coverage**: Maintain >90% coverage throughout migration

### Business Metrics
- **Zero Downtime**: No user-facing service interruptions
- **Feature Parity**: All legacy functionality preserved
- **Developer Experience**: Improved development workflow and debugging
- **Maintainability**: Reduced technical debt and improved code organization

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | Week 1-2 | Provider unification, type system, extended API client |
| Phase 2 | Week 3-8 | All plugins migrated to federated architecture |
| Phase 3 | Week 9-12 | Advanced features (MCP, workers, events) migrated |
| Phase 4 | Week 13-16 | Legacy system removed, optimization complete |

**Total Duration**: 16 weeks
**Milestone Reviews**: End of each phase
**Go/No-Go Gates**: Before Phases 3 and 4