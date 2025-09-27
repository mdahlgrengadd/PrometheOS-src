# API Refactoring Plan: Complete Module Federation Implementation

## Overview

This document outlines the implementation strategy for refactoring all legacy API features (`src/api/`) into the new Module Federation (MF) architecture. The goal is to achieve 100% feature parity while leveraging the improved architecture patterns already established in the MF system.

## Current State

### ✅ What's Working in MF
- **Dual-Pattern Architecture**: React Context + Bridge patterns
- **Component Registry**: Registration/deregistration with remote ID prefixing
- **Action Execution**: Basic event-driven action handling
- **Event Integration**: subscribe/emit functionality
- **Parameter Validation**: Security validation layer
- **Testing Interface**: Global `__PROMETHEOS_API__` for debugging

### ❌ Missing Legacy Features
- **System API Services** (app launching, notifications, dialogs)
- **Complete MCP Protocol** (tools/list, tools/call, auto-registration)
- **Worker Communication** (Comlink bridge, global API exposure)
- **OpenAPI Documentation** (dynamic spec generation)
- **Advanced Action Handling** (component ID normalization, sophisticated validation)

## Implementation Plan

## Phase 1: System API Services Implementation

### Objective
Port the comprehensive system API that provides core OS-like functionality.

### Target Features
```typescript
// System actions to implement:
"sys.open"           // Application launcher with URL support
"sys.kill"           // Application termination
"sys.notify"         // Multi-engine notification system
"sys.dialog"         // Modal confirmation dialogs
"sys.events.waitFor" // Event subscription waiter
"sys.events.list"    // Event registry listing
```

### Implementation Structure
```
packages/shared-system-api/
├── src/
│   ├── SystemApiProvider.tsx    # Main provider component
│   ├── systemActions.ts         # System API component definition
│   ├── services/
│   │   ├── AppLauncher.ts       # App launching logic
│   │   ├── NotificationEngine.ts # Toast/notification system
│   │   ├── DialogManager.ts     # Modal dialog handling
│   │   └── EventWaiter.ts       # Event subscription utilities
│   ├── types.ts                 # TypeScript definitions
│   └── index.ts                 # Package exports
└── package.json
```

### Key Components

#### SystemApiProvider.tsx
```typescript
import React, { createContext, useContext, useCallback } from 'react';
import { IApiComponent } from '@shared/api-client';
import { systemApiComponent } from './systemActions';

interface SystemApiContextType {
  openApp: (appId: string, initFromUrl?: string) => Promise<void>;
  killApp: (windowId: string) => Promise<void>;
  notify: (message: string, engine?: string) => Promise<void>;
  showDialog: (config: DialogConfig) => Promise<boolean>;
  waitForEvent: (eventName: string, timeout?: number) => Promise<any>;
  listEvents: () => Promise<string[]>;
}

export const SystemApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Implementation logic here
  // Register systemApiComponent with host's API registry
  // Provide system action implementations
};
```

#### systemActions.ts
```typescript
import { IApiComponent } from '@shared/api-client';

export const systemApiComponent: IApiComponent = {
  id: 'system',
  name: 'System API',
  description: 'Core system operations for PrometheOS',
  actions: [
    {
      id: 'open',
      name: 'Open Application',
      description: 'Launch an application by ID',
      parameters: [
        { name: 'appId', type: 'string', required: true },
        { name: 'initFromUrl', type: 'string', required: false }
      ],
      handler: 'sys.open'
    },
    {
      id: 'kill',
      name: 'Kill Application',
      description: 'Terminate an application window',
      parameters: [
        { name: 'windowId', type: 'string', required: true }
      ],
      handler: 'sys.kill'
    },
    {
      id: 'notify',
      name: 'Send Notification',
      description: 'Display a system notification',
      parameters: [
        { name: 'message', type: 'string', required: true },
        { name: 'engine', type: 'string', required: false }
      ],
      handler: 'sys.notify'
    },
    {
      id: 'dialog',
      name: 'Show Dialog',
      description: 'Display a confirmation dialog',
      parameters: [
        { name: 'title', type: 'string', required: true },
        { name: 'message', type: 'string', required: true },
        { name: 'type', type: 'string', required: false }
      ],
      handler: 'sys.dialog'
    },
    {
      id: 'events.waitFor',
      name: 'Wait for Event',
      description: 'Wait for a specific event to occur',
      parameters: [
        { name: 'eventName', type: 'string', required: true },
        { name: 'timeout', type: 'number', required: false }
      ],
      handler: 'sys.events.waitFor'
    },
    {
      id: 'events.list',
      name: 'List Events',
      description: 'Get list of available events',
      parameters: [],
      handler: 'sys.events.list'
    }
  ]
};
```

### Integration Points
- Auto-register with host's ApiProvider during bootstrap
- Integrate with existing window store for app lifecycle
- Connect to toast/notification system
- Wire up event bus for event operations

## Phase 2: Complete MCP Protocol Implementation

### Objective
Implement full MCP (Model Context Protocol) support with automatic tool registration.

### Target Features
- JSON-RPC 2.0 compliant messaging
- `tools/list` - List available API tools
- `tools/call` - Execute API actions as tools
- `resources/list` - List available resources
- `resources/read` - Read resource content
- Automatic registration of API components as MCP tools

### Implementation Structure
```
packages/shared-mcp-protocol/
├── src/
│   ├── MCPServer.tsx            # MCP server provider
│   ├── MCPProtocolHandler.ts    # Request/response processing
│   ├── MCPToolRegistry.ts       # Automatic tool registration
│   ├── workers/
│   │   └── MCPWorkerBridge.ts   # Worker integration
│   ├── types/
│   │   ├── mcp.ts              # MCP protocol types
│   │   └── tools.ts            # Tool definition types
│   └── index.ts
└── package.json
```

### Key Components

#### MCPProtocolHandler.ts
```typescript
export class MCPProtocolHandler {
  constructor(private apiRegistry: Map<string, IApiComponent>) {}

  async processMessage(message: MCPRequest): Promise<MCPResponse> {
    switch (message.method) {
      case 'tools/list':
        return this.handleToolsList(message);
      case 'tools/call':
        return this.handleToolsCall(message);
      case 'resources/list':
        return this.handleResourcesList(message);
      case 'resources/read':
        return this.handleResourcesRead(message);
      default:
        throw new MCPError('Method not found', -32601);
    }
  }

  private async handleToolsList(message: MCPRequest): Promise<MCPResponse> {
    const tools = Array.from(this.apiRegistry.values())
      .flatMap(component => component.actions.map(action => ({
        name: `${component.id}.${action.id}`,
        description: action.description,
        inputSchema: this.generateInputSchema(action.parameters)
      })));

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { tools }
    };
  }

  private async handleToolsCall(message: MCPRequest): Promise<MCPResponse> {
    const { name, arguments: args } = message.params;
    const [componentId, actionId] = name.split('.');

    // Execute action through API system
    const result = await this.executeAction(componentId, actionId, args);

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { content: [{ type: 'text', text: JSON.stringify(result) }] }
    };
  }
}
```

#### MCPServer.tsx
```typescript
export const MCPServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mcpHandler, setMcpHandler] = useState<MCPProtocolHandler | null>(null);
  const { registry } = useApiRegistry();

  useEffect(() => {
    // Initialize MCP handler with current API registry
    const handler = new MCPProtocolHandler(registry);
    setMcpHandler(handler);

    // Set up worker communication for MCP
    setupMCPWorkerBridge(handler);
  }, [registry]);

  return (
    <MCPContext.Provider value={{ mcpHandler }}>
      {children}
    </MCPContext.Provider>
  );
};
```

### Worker Integration
- Integrate with existing `src/worker/plugins/mcp-server.ts`
- Provide worker-to-host communication bridge
- Auto-register API components as MCP tools when components are registered

## Phase 3: Worker Communication Bridge

### Objective
Implement Comlink bridge for seamless worker communication with API access.

### Implementation Structure
```
packages/shared-worker-bridge/
├── src/
│   ├── WorkerBridgeProvider.tsx  # Main provider
│   ├── ComlinkHandler.ts         # Comlink setup
│   ├── GlobalApiExposer.ts       # Global API context
│   ├── WorkerApiProxy.ts         # Worker-side API proxy
│   └── types.ts
└── package.json
```

### Key Components

#### WorkerBridgeProvider.tsx
```typescript
export const WorkerBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiClient = useApiClient();

  useEffect(() => {
    // Expose global desktop API context
    window.desktop = {
      api: createWorkerApiProxy(apiClient)
    };

    // Setup Comlink bridge for workers
    setupComlinkBridge(apiClient);
  }, [apiClient]);

  return <>{children}</>;
};
```

#### ComlinkHandler.ts
```typescript
import * as Comlink from 'comlink';

export const setupComlinkBridge = (apiClient: ApiClient) => {
  // Expose API client methods to workers via Comlink
  const workerApi = {
    executeAction: (componentId: string, actionId: string, parameters: any) =>
      apiClient.executeAction(componentId, actionId, parameters),

    subscribe: (eventName: string) =>
      apiClient.subscribe(eventName),

    emit: (eventName: string, data: any) =>
      apiClient.emit(eventName, data)
  };

  // Make available to workers
  Comlink.expose(workerApi, self as any);
};
```

### Integration Requirements
- Global API exposure: `window.desktop.api`
- Comlink bridge for Python/Pyodide workers
- Maintain existing worker plugin architecture

## Phase 4: OpenAPI Documentation System

### Objective
Implement dynamic OpenAPI specification generation from registered API components.

### Implementation Structure
```
packages/shared-documentation/
├── src/
│   ├── OpenApiGenerator.ts      # Spec generation
│   ├── DocumentationProvider.tsx # React provider
│   ├── hooks/
│   │   └── useOpenApiSpec.ts    # React hook
│   └── types/
│       └── openapi.ts           # OpenAPI types
└── package.json
```

### Key Components

#### OpenApiGenerator.ts
```typescript
export const generateOpenApiSpec = (
  components: IApiComponent[],
  config: OpenApiConfig
): IOpenApiSpec => {
  const paths: Record<string, any> = {};

  // Generate paths from API components
  components.forEach(component => {
    component.actions.forEach(action => {
      const path = `/api/${component.id}/${action.id}`;
      paths[path] = {
        post: {
          summary: action.description,
          parameters: generateParameters(action.parameters),
          responses: generateResponses(action)
        }
      };
    });
  });

  return {
    openapi: '3.0.0',
    info: {
      title: 'PrometheOS API',
      version: '1.0.0',
      description: 'Desktop environment API specification'
    },
    servers: config.servers,
    paths
  };
};
```

## Phase 5: Advanced Action Handling Enhancements

### Objective
Port sophisticated action handling features from legacy system.

### Enhancements
- Component ID normalization (`@src` suffix handling)
- Advanced parameter validation and type coercion
- Comprehensive error handling and logging
- Action lifecycle event emission

### Enhanced executeAction Implementation
```typescript
export const executeAction = async (
  componentId: string,
  actionId: string,
  parameters: Record<string, any>
): Promise<any> => {
  // Normalize component ID (handle @src suffix)
  const normalizedComponentId = normalizeComponentId(componentId);

  // Validate component exists
  const component = registry.get(normalizedComponentId);
  if (!component) {
    throw new Error(`Component not found: ${normalizedComponentId}`);
  }

  // Find action
  const action = component.actions.find(a => a.id === actionId);
  if (!action) {
    throw new Error(`Action not found: ${actionId}`);
  }

  // Advanced parameter validation
  const validatedParams = validateAndCoerceParameters(action.parameters, parameters);

  // Emit action start event
  eventBus.emit('action.start', { componentId, actionId, parameters: validatedParams });

  try {
    // Execute action
    const result = await actionHandlers.get(action.handler)?.(validatedParams);

    // Emit action success event
    eventBus.emit('action.success', { componentId, actionId, result });

    return result;
  } catch (error) {
    // Emit action error event
    eventBus.emit('action.error', { componentId, actionId, error });
    throw error;
  }
};
```

## Implementation Schedule

### Week 1-2: System API Services
- Create `shared-system-api` package
- Implement system actions and providers
- Integrate with host application
- Test app launching, notifications, dialogs

### Week 3-4: MCP Protocol Implementation
- Create `shared-mcp-protocol` package
- Implement full MCP protocol handler
- Integrate with existing MCP worker
- Test JSON-RPC 2.0 compliance and tool registration

### Week 5-6: Worker Communication Bridge
- Create `shared-worker-bridge` package
- Implement Comlink bridge and global API exposure
- Test with Pyodide and other workers
- Ensure backward compatibility

### Week 7: OpenAPI Documentation
- Create `shared-documentation` package
- Implement dynamic spec generation
- Add documentation hooks and providers
- Test with API explorer integration

### Week 8: Advanced Features & Polish
- Enhance action handling with legacy features
- Add comprehensive test coverage
- Performance optimization
- Final integration testing

## Package Dependencies

### New Package Structure
```json
{
  "packages/shared-system-api": {
    "dependencies": {
      "@shared/api-client": "workspace:*",
      "@shared/ui-kit": "workspace:*"
    }
  },
  "packages/shared-mcp-protocol": {
    "dependencies": {
      "@shared/api-client": "workspace:*",
      "comlink": "^4.4.1"
    }
  },
  "packages/shared-worker-bridge": {
    "dependencies": {
      "@shared/api-client": "workspace:*",
      "comlink": "^4.4.1"
    }
  },
  "packages/shared-documentation": {
    "dependencies": {
      "@shared/api-client": "workspace:*"
    }
  }
}
```

### Host Integration
```typescript
// apps/desktop-host/src/core/DesktopBootstrap.tsx
import { SystemApiProvider } from '@shared/system-api';
import { MCPServerProvider } from '@shared/mcp-protocol';
import { WorkerBridgeProvider } from '@shared/worker-bridge';

export const DesktopBootstrap = () => (
  <ApiProvider>
    <SystemApiProvider>
      <MCPServerProvider>
        <WorkerBridgeProvider>
          <ThemeProvider>
            <DesktopHost />
          </ThemeProvider>
        </WorkerBridgeProvider>
      </MCPServerProvider>
    </SystemApiProvider>
  </ApiProvider>
);
```

## Testing Strategy

### Unit Tests
- Each package includes comprehensive test suite
- Mock dependencies and test in isolation
- Cover all action handlers and edge cases

### Integration Tests
- Test host-remote communication patterns
- Verify MCP protocol compliance
- Test worker communication bridges

### E2E Tests
- Full system functionality tests
- User workflow validation
- Performance benchmarking

## Success Criteria

- ✅ **100% Feature Parity**: All legacy API functionality replicated
- ✅ **Improved Architecture**: Cleaner, more modular design
- ✅ **Backward Compatibility**: Existing remotes continue working
- ✅ **Performance**: No degradation in action execution time
- ✅ **Documentation**: Comprehensive API documentation
- ✅ **Test Coverage**: >90% coverage across all packages

## Migration Benefits

### Architectural Improvements
- **Modular Design**: Features split into focused packages
- **Better Testing**: Isolated components easier to test
- **Improved Maintenance**: Clear separation of concerns
- **Federation Ready**: Each package can be independently versioned

### Developer Experience
- **Type Safety**: Full TypeScript support across all packages
- **Clear APIs**: Well-defined interfaces and contracts
- **Documentation**: Auto-generated OpenAPI specs
- **Debugging**: Enhanced testing interface and logging

This refactoring plan provides a complete roadmap for implementing all legacy API features in the Module Federation architecture while maintaining the sophisticated capabilities that make the current system powerful.