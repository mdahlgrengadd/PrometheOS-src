# Proposal: Hybrid Python-Desktop API Bridge & MCP Protocol Strategy

## Overview

To maximize both developer ergonomics and protocol compliance, we propose a **hybrid integration strategy** for Python scripting in the Dreamscape desktop environment. This approach combines the strengths of [Comlink](https://github.com/GoogleChromeLabs/comlink) for seamless Python↔Desktop API calls, with direct message-passing for strict MCP (Model Context Protocol) JSON-RPC 2.0 interoperability.

---

## Goals

- **Python Scripting Ergonomics:** Enable Python scripts to call desktop APIs with natural, awaitable syntax and receive real results.
- **MCP Protocol Compliance:** Support standards-based, message-driven function calling for LLM agents and external tools.
- **Extensibility:** Allow both scripting and agentic workflows to coexist and interoperate.

---

## Architecture

### 1. **Comlink Layer (Python ↔ Desktop API)**
- **Purpose:** Direct, ergonomic API calls from Python scripts.
- **How:** Expose the API context (`executeAction`, `listComponents`, etc.) to the Pyodide worker using Comlink.
- **Result:** Python code can `await desktop.api.execute(...)` and receive the actual result.

**Example:**
```python
result = await desktop.api.execute("calculator", "add", {"a": 2, "b": 3})
print(result)  # {'success': True, 'result': 5}
```

2. Raw Message Layer (MCP Protocol)
Purpose: Standards-compliant JSON-RPC 2.0 message exchange for LLMs and external agents.
How: Use postMessage to send/receive raw MCP protocol messages between Python and the main thread.
Result: Enables function calling, tool registration, and event streaming per MCP spec.
Example:

# Send a JSON-RPC 2.0 request
```
desktop.mcp.send({
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {"name": "calculator_add", "arguments": {"a": 2, "b": 3}}
})
```
Implementation Steps
Expose API Context via Comlink

Wrap the main API context (ApiContext.tsx) with Comlink.
In the Pyodide worker, import Comlink and connect to the exposed API.
Provide a Pythonic interface (desktop.api) that proxies to Comlink methods.
Maintain Raw Message Handler for MCP

Continue supporting postMessage for JSON-RPC 2.0 messages.
Route MCP messages to a dedicated handler in the main thread.
Ensure all MCP responses conform to the protocol.
Python API Surface

desktop.api: For ergonomic scripting (Comlink-backed).
desktop.mcp: For protocol-level messaging (postMessage-backed).
Testing & Validation

Write Python tests for both direct API calls and MCP protocol messages.
Validate that LLM agents can function-call via MCP, and scripts can use the ergonomic API.
Benefits
Best of Both Worlds: Clean scripting for developers, strict protocol for LLMs/agents.
Future-Proof: Easy to extend with new APIs or MCP endpoints.
Interoperable: Compatible with both internal scripts and external AI tools.

Example Usage
```
# Ergonomic scripting (Comlink)
result = await desktop.api.execute("calculator", "add", {"a": 10, "b": 5})
```

# MCP protocol (raw message)
```
desktop.mcp.send({
    "jsonrpc": "2.0",
    "id": 42,
    "method": "tools/call",
    "params": {"name": "calculator_add", "arguments": {"a": 10, "b": 5}}
})
```
References
Comlink Documentation
JSON-RPC 2.0 Spec
Model Context Protocol (MCP) Draft
This hybrid strategy ensures both developer productivity and robust, standards-based AI integration for the Dreamscape platform.