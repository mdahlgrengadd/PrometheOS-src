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

## Implementation

The implementation consists of:

1. **HybridDesktopApiBridge.ts** - Main bridge implementation with both interfaces
2. **MCPProtocolHandler** - Handles JSON-RPC 2.0 message processing
3. **Python API Surface** - Provides both interfaces via `desktop.api` and `desktop.mcp`
4. **Comlink Integration** - Uses MessageChannel to establish Comlink connection
5. **WorkerPluginManagerClient** - Routes messages between main thread and worker

## Testing

You can test both interfaces using the Pyodide Test app, which includes a dedicated Hybrid Bridge Test component.

## Usage Guide

### Choosing the Right Interface

- **For Scripting**: Use the Comlink interface (`desktop.api`) for direct, ergonomic access
- **For AI Integration**: Use the MCP Protocol interface (`desktop.mcp`) for JSON-RPC 2.0 compatible function calling

### Error Handling

Both interfaces provide proper error handling mechanisms:

```python
# Comlink error handling
try:
    result = await desktop.api.execute("nonexistent", "action")
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