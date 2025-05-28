# Hybrid Python-Desktop API Bridge

This implementation provides a dual-interface bridge between Python (Pyodide) and the Desktop API system:

## Architecture

### 1. Comlink Interface (Ergonomic API)

The Comlink interface provides a direct, ergonomic API for Python scripts to call desktop APIs:

```python
# Python code using Comlink interface
result = await desktop.api.execute("calculator", "add", {"a": 5, "b": 7})
print(f"Result: {result}")  # Direct access to the result
```

This interface:

- Returns actual results directly
- Uses async/await for proper promise handling
- Provides natural method calls
- Minimizes boilerplate

### 2. MCP Protocol Interface (JSON-RPC 2.0)

The MCP Protocol interface follows the Model Context Protocol standard for AI-compatible function calling:

```python
# Python code using MCP protocol
response = await desktop.mcp.send({
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
        "name": "calculator.add",
        "arguments": {"a": 5, "b": 7}
    },
    "id": "request-123"
})
```

This interface:

- Follows strict JSON-RPC 2.0 protocol
- Enables LLM function calling
- Supports standard MCP endpoints like tools/list, tools/call
- Maintains full compatibility with AI agents

### 3. PrometheOS Client Library (Type-Safe TypeScript)

The PrometheOS Client provides a statically typed façade over the bridge with full IntelliSense support:

```typescript
import { launcher, dialog } from 'prometheos-client';

// Type-safe API calls with full autocompletion
const result = await launcher.launchApp({ appId: 'calculator' });
const userChoice = await dialog.openDialog({
  title: 'Confirm Action',
  description: 'Are you sure you want to proceed?'
});
```

This interface:

- **Full TypeScript support** with IntelliSense and type checking
- **Auto-generated from OpenAPI spec** - always up to date
- **Namespace-based organization** by component
- **Request/response type safety**
- **Direct access to low-level API** via `api.execute()`

## Code Generation Workflow

The type-safe client is automatically generated from the OpenAPI specification:

### Build Process

```bash
# Generate OpenAPI spec and TypeScript client
npm run codegen

# Or step by step:
npm run build:openapi  # Generate openapi.json
node scripts/generate-client.js  # Generate TypeScript client
```

This creates:

- `openapi.json` - Complete OpenAPI 3.0 specification
- `src/prometheos-client/index.ts` - Type-safe TypeScript client

### Package.json Scripts

```json
{
  "scripts": {
    "build:openapi": "node scripts/generate-openapi.js",
    "codegen": "npm run build:openapi && node scripts/generate-client.js"
  }
}
```

## Implementation

The implementation consists of:

1. **HybridDesktopApiBridge.ts** - Main bridge implementation with both interfaces
2. **MCPProtocolHandler** - Handles JSON-RPC 2.0 message processing  
3. **scripts/generate-openapi.js** - Extracts API definitions and generates OpenAPI spec
4. **scripts/generate-client.js** - Generates TypeScript client from OpenAPI spec
5. **Python API Surface** - Provides both interfaces via `desktop.api` and `desktop.mcp`
6. **Comlink Integration** - Uses MessageChannel to establish Comlink connection
7. **WorkerPluginManagerClient** - Routes messages between main thread and worker

## Usage Guide

### Choosing the Right Interface

- **For TypeScript Development**: Use the PrometheOS Client (`prometheos-client`) for full type safety
- **For Scripting**: Use the Comlink interface (`desktop.api`) for direct, ergonomic access
- **For AI Integration**: Use the MCP Protocol interface (`desktop.mcp`) for JSON-RPC 2.0 compatible function calling

### TypeScript Examples

```typescript
import { launcher, dialog, onEvent, event } from 'prometheos-client';

// Launch applications
await launcher.launchApp({ appId: 'notepad' });
await launcher.killApp({ appId: 'calculator' });

// Show notifications  
await launcher.notify({ 
  message: 'Task completed!', 
  type: 'sonner' 
});

// User dialogs
const result = await dialog.openDialog({
  title: 'Delete File',
  description: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel'
});

if (result.data?.confirmed) {
  console.log('User confirmed deletion');
}

// Event handling
const events = await event.listEvents({});
console.log('Available events:', events.data);

// Wait for specific events
const eventData = await onEvent.waitForEvent({
  eventId: 'file:uploaded',
  timeout: 5000
});
```

### Python Examples

```python
# Comlink error handling
try:
    result = await desktop.api.execute("launcher", "launchApp", {"appId": "notepad"})
    if result["success"]:
        print(f"App launched: {result['data']['message']}")
except Exception as e:
    print(f"Error: {e}")

# MCP protocol error handling  
try:
    response = await desktop.mcp.send({
        "jsonrpc": "2.0",
        "method": "tools/call", 
        "params": {
            "name": "launcher.notify",
            "arguments": {"message": "Hello from Python!"}
        },
        "id": "py-001"
    })
    print(f"MCP Response: {response}")
except Exception as e:
    print(f"MCP Error: {e}")
```

### Low-Level Access

```typescript
import { api } from 'prometheos-client';

// Direct access to the underlying bridge
const result = await api.execute('launcher', 'launchApp', { appId: 'calculator' });
```

## Testing

You can test all interfaces using the Pyodide Test app, which includes:

- **Comlink Bridge Test** - Direct API testing
- **MCP Protocol Test** - JSON-RPC 2.0 testing  
- **Hybrid Bridge Test** - Combined interface testing
- **Type Safety Demo** - TypeScript client examples

## API Reference

### Available Components

#### launcher

- `launchApp(params: { appId: string })` - Launch an application
- `killApp(params: { appId: string })` - Close an application  
- `notify(params: { message: string, type?: "radix" | "sonner" })` - Show notification

#### dialog

- `openDialog(params: { title: string, description?: string, confirmLabel?: string, cancelLabel?: string })` - Show confirmation dialog

#### onEvent

- `waitForEvent(params: { eventId: string, timeout?: number })` - Wait for event emission

#### event

- `listEvents(params: {})` - Get all available event names

All methods return `Promise<ApiResponse<T>>` where:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Error Handling Examples

```python
# Comlink error handling
try:
    result = await desktop.api.execute("launcher", "launchApp", {"appId": "notepad"})
    if not result["success"]:
        print(f"Error: {result.get('error', 'Unknown error')}")
except Exception as e:
    print(f"Error: {e}")

# MCP error handling (follows JSON-RPC 2.0 error format)
response = await desktop.mcp.send({...})
if "error" in response:
    print(f"Error: {response['error']['message']}")
```

## Future Enhancements

- **Promise Integration**: Enhanced promise handling for parallel requests
- **Batch Processing**: Support for batched MCP requests
- **Stream Support**: Streaming responses for long-running operations
- **Resource API**: Full implementation of MCP resources endpoints