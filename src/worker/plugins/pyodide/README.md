# Pyodide Plugin Refactored Structure

This directory contains the refactored Pyodide worker plugin, split into smaller, more manageable files.

## Structure

```
pyodide/
├── types.ts                    # TypeScript type definitions
├── core.ts                     # Core Pyodide functionality (initialization, execution)
├── bridge.ts                   # Bridge setup between Python and JavaScript
├── mcp-handler.ts              # MCP protocol message handling
├── comlink-handler.ts          # Comlink communication handling
├── desktop-api-handler.ts      # Desktop API request handling
├── python-loader.ts            # Utilities for loading Python code
├── index.ts                    # Main plugin that combines all components
└── python/                     # Python code files
    ├── desktop_api.py          # Desktop API (Comlink interface)
    ├── desktop_api_legacy.py   # Desktop API (postMessage interface)
    ├── events.py               # Event system classes
    ├── mcp_protocol.py         # MCP protocol implementation
    ├── comlink_helpers.py      # Comlink integration helpers
    └── bridge_init.py          # Bridge initialization and setup
```

## Key Components

### TypeScript Files

- **types.ts**: Contains all TypeScript interfaces and type definitions used across the plugin
- **core.ts**: Handles Pyodide initialization, Python execution, and package management
- **bridge.ts**: Manages the setup of the Python-JavaScript bridge
- **mcp-handler.ts**: Processes MCP (Model Context Protocol) JSON-RPC 2.0 messages
- **comlink-handler.ts**: Handles Comlink port communication with the main thread
- **desktop-api-handler.ts**: Processes desktop API requests from Python
- **python-loader.ts**: Utilities for loading and combining Python code files
- **index.ts**: Main plugin file that orchestrates all components

### Python Files

- **desktop_api.py**: Modern Comlink-based API interface
- **desktop_api_legacy.py**: Legacy postMessage-based API interface
- **events.py**: Event system for both modern and legacy modes
- **mcp_protocol.py**: MCP protocol implementation for tool calling
- **comlink_helpers.py**: Utilities for better Python-Comlink integration
- **bridge_init.py**: Initializes the complete bridge and creates the `desktop` global

## Usage

The refactored plugin maintains the same external API as before. Import it like:

```typescript
import PyodideWorker from './pyodide';
```

The plugin will automatically:
1. Load all Python components
2. Combine them into a single execution context
3. Set up the hybrid bridge with both Comlink and postMessage interfaces
4. Expose the `desktop` global in Python with APIs for:
   - `desktop.api` (Comlink interface)
   - `desktop.events` (Event system)
   - `desktop.mcp` (MCP protocol)
   - `desktop.api_legacy` (postMessage interface)
   - `desktop.events_legacy` (Legacy events)

## Benefits of Refactoring

1. **Modularity**: Each component has a single responsibility
2. **Maintainability**: Easier to modify individual features
3. **Readability**: Python code is in separate files with syntax highlighting
4. **Testability**: Individual components can be tested in isolation
5. **Reusability**: Components can be reused across different contexts
6. **Type Safety**: Better TypeScript integration and type checking

## Python Integration

The Python bridge provides two interfaces:

### Modern Interface (Comlink)
```python
# List components
components = await desktop.api.list_components()

# Execute actions  
result = await desktop.api.execute('notepad', 'open', {'file': 'test.txt'})

# Subscribe to events
unsubscribe = await desktop.events.subscribe('window:focus', callback)
```

### Legacy Interface (postMessage)
```python
# For compatibility with older code
desktop.api_legacy.list_components()
desktop.api_legacy.execute('notepad', 'open', {'file': 'test.txt'})
desktop.events_legacy.subscribe('window:focus', callback)
```

### MCP Protocol
```python
# Call tools via MCP
result = await desktop.mcp.tools_call('file_reader', {'path': '/path/to/file'})

# List available tools
tools = await desktop.mcp.tools_list()
```
