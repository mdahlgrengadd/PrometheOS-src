# Roadmap: Model Context Protocol (MCP) Integration with Pyodide/Python Scripting

## Context Recap

### Current Project State
The Desktop Dreamscape is a sophisticated desktop OS shell with the following **established systems**:

#### **Plugin System** 
- ✅ **Static/Dynamic Loading**: Plugins loaded via manifest, stored in localStorage
- ✅ **Worker Support**: WorkerPluginManagerClient handles compute-intensive tasks
- ✅ **EventBus**: Decoupled communication between plugins and core
- ✅ **Lifecycle Management**: `init`, `render`, `onOpen`, `onClose` hooks

#### **API System**
- ✅ **Component Registration**: `withApi` HOC and `useApiComponent` hook for automation
- ✅ **Action Handlers**: `registerApiActionHandler` for component interaction
- ✅ **OpenAPI Generation**: Automatic spec generation from registered components
- ✅ **EventBus Integration**: All API actions emit events (`api:action:executed`)

#### **WebLLM Chat Application**
- ✅ **Workerized**: Fully moved to Web Worker for non-blocking AI inference
- ✅ **Streaming Support**: Real-time response streaming from models
- ✅ **API Integration**: Exposed as API component for external automation
- ✅ **Multiple Models**: Llama-3.1-8B, Phi-3-mini, Gemma-2B, Mistral-7B support

#### **Existing Automation Infrastructure**
- ✅ **Macro System**: Records/replays API action sequences 
- ✅ **Window Management**: UnifiedWindowShellV2 with programmatic control
- ✅ **Theme System**: Dynamic theme loading and CSS variable management

### Integration Target: MCP + Pyodide
**Goal**: Enable WebLLM to discover and call desktop apps using **Model Context Protocol (MCP) tools**, while adding **Pyodide/Python scripting** as a fundamental runtime layer for advanced automation and data processing.

---

## Status Assessment

### ✅ **Ready Systems**
- **Plugin Infrastructure**: Worker support, EventBus, lifecycle management
- **API Registration**: Components can expose programmatic interfaces
- **WebLLM Integration**: Streaming chat with API exposure
- **Event System**: Real-time communication between components

### 🔶 **Partial Systems** 
- **Macro Recording**: Manual action replay (needs Python script integration)
- **API Explorer**: Static discovery (needs MCP tool registration)

### ❌ **Missing Systems**
- **Pyodide Runtime**: Python interpreter in Web Worker context
- **MCP Server**: Tool registration, discovery, and execution protocol
- **Python-API Bridge**: Call desktop APIs from Python scripts
- **Tool Schema Generation**: Convert API components to MCP tool definitions
- **WebLLM-MCP Integration**: Function calling from chat interface

---

## Phased Implementation Plan

### **Phase 1: Pyodide Foundation** *(Sprints 1.1-1.2)*

#### **Sprint 1.1: Pyodide Worker Setup**
**Duration**: 3-4 days
**Deliverables**:
- [ ] Create `PyodideWorkerPlugin` in `src/worker/plugins/pyodide.ts`
- [ ] Setup Pyodide initialization with standard library + `micropip`
- [ ] Basic Python code execution with result serialization
- [ ] Error handling and timeout management

**Technical Notes**:
- Follow existing worker plugin pattern (see `webllm.ts`)
- Use Comlink for Python execution API
- Include `asyncio`, `json`, `urllib` in Pyodide environment

#### **Sprint 1.2: Python-Desktop API Bridge**
**Duration**: 4-5 days  
**Deliverables**:
- [ ] `DesktopAPI` Python module injected into Pyodide context
- [ ] Python functions to call registered API components
- [ ] Bidirectional data exchange (Python ↔ EventBus)
- [ ] Basic Python REPL component for testing

**Implementation**:
```python
# Example API bridge usage
import desktop

# List all available components
components = desktop.api.list_components()

# Execute actions on components
result = desktop.api.execute("webllm-chat-input", "sendMessage", {"message": "Hello"})

# Listen for events
desktop.events.subscribe("webllm:answerCompleted", callback)
```

### **Phase 2: MCP Server Infrastructure** *(Sprints 2.1-2.2)*

#### **Sprint 2.1: MCP Protocol Implementation**
**Duration**: 5-6 days
**Deliverables**:
- [ ] MCP server worker (`src/worker/plugins/mcp-server.ts`)
- [ ] Tool registration from API components
- [ ] JSON-RPC 2.0 protocol handler
- [ ] Tool schema generation (API actions → MCP tools)

**Technical Details**:
- Each API component becomes an MCP tool
- Tool parameters from OpenAPI action definitions
- Resource discovery for file system, app state, etc.

#### **Sprint 2.2: Tool Discovery & Execution**
**Duration**: 4-5 days
**Deliverables**:
- [ ] Dynamic tool registration when plugins load/unload
- [ ] Tool execution with parameter validation  
- [ ] Result formatting for LLM consumption
- [ ] Tool categorization (System, Apps, Automation)

**MCP Tool Categories**:
- **System Tools**: `launcher.launchApp`, `dialog.openDialog`, `notify`
- **App Tools**: `webllm-chat.sendMessage`, `notepad.setText`, `calculator.add`
- **Automation Tools**: `macro.execute`, `workflow.run`, `python.eval`

### **Phase 3: WebLLM Function Calling** *(Sprints 3.1-3.2)*

#### **Sprint 3.1: Function Calling Integration**
**Duration**: 6-7 days
**Deliverables**:
- [ ] Extend WebLLM worker with function calling support
- [ ] MCP tool definitions passed to model context
- [ ] Tool call parsing and execution pipeline
- [ ] Parallel tool execution for complex workflows

**Architecture**:
```typescript
// WebLLM enhanced with MCP tools
const tools = await mcpServer.getAvailableTools();
const response = await engine.chat.completions.create({
  messages,
  tools,
  tool_choice: "auto"
});
```

#### **Sprint 3.2: Advanced Function Patterns**
**Duration**: 4-5 days
**Deliverables**:
- [ ] Tool result injection back into conversation
- [ ] Multi-step tool execution workflows
- [ ] Context preservation across tool calls
- [ ] Error recovery and retry mechanisms

### **Phase 4: Python Scripting Integration** *(Sprints 4.1-4.2)*

#### **Sprint 4.1: Python Script Management**
**Duration**: 5-6 days
**Deliverables**:
- [ ] Python script plugin for saving/loading scripts
- [ ] Script editor with syntax highlighting
- [ ] Integration with macro system (Python → API actions)
- [ ] Script library and template system

#### **Sprint 4.2: Advanced Python Capabilities**
**Duration**: 6-7 days
**Deliverables**:
- [ ] Data processing libraries (`pandas`, `numpy` via Pyodide)
- [ ] File system access through MCP resources
- [ ] Long-running script execution with progress tracking
- [ ] Python package management interface

### **Phase 5: Integration & Polish** *(Sprints 5.1-5.2)*

#### **Sprint 5.1: WebLLM + MCP End-to-End**
**Duration**: 4-5 days
**Deliverables**:
- [ ] Complete WebLLM → MCP → Desktop Apps workflow
- [ ] Chat interface showing tool calls and results
- [ ] Tool suggestion and auto-completion
- [ ] Conversational Python script generation

**Example Workflow**:
1. User: "Create a note with today's tasks and send it to chat"
2. WebLLM calls: `notepad.setText`, `webllm-chat.sendMessage`
3. Tools execute, results shown in chat
4. Follow-up conversations reference tool outputs

#### **Sprint 5.2: Documentation & Testing**
**Duration**: 3-4 days
**Deliverables**:
- [ ] Comprehensive developer documentation
- [ ] User guide for MCP + Python features
- [ ] Integration tests for tool calling workflows
- [ ] Performance optimization and monitoring

---

## Summary Table

| Phase | Sprint | Duration | Goal |
|-------|--------|----------|------|
| 1 | 1.1 | 3-4 days | Pyodide Worker Setup |
| 1 | 1.2 | 4-5 days | Python-Desktop API Bridge |
| 2 | 2.1 | 5-6 days | MCP Protocol Implementation |
| 2 | 2.2 | 4-5 days | Tool Discovery & Execution |
| 3 | 3.1 | 6-7 days | Function Calling Integration |
| 3 | 3.2 | 4-5 days | Advanced Function Patterns |
| 4 | 4.1 | 5-6 days | Python Script Management |
| 4 | 4.2 | 6-7 days | Advanced Python Capabilities |
| 5 | 5.1 | 4-5 days | End-to-End Integration |
| 5 | 5.2 | 3-4 days | Documentation & Testing |

**Total Estimated Duration**: 45-54 days (9-11 weeks)

---

## Expected Outcomes

### **For Users**
- **Conversational Desktop Control**: Ask WebLLM to manipulate any desktop app
- **Powerful Automation**: Python scripts that integrate with all system components
- **Intelligent Workflows**: AI-generated automation based on user intent

### **For Developers**  
- **Unified API Surface**: All desktop functionality exposed through MCP tools
- **Python Integration**: Full Python runtime for complex data processing
- **Extensible Architecture**: Easy to add new tools and capabilities

### **Technical Architecture**
- **WebLLM** ↔ **MCP Server** ↔ **Desktop APIs** ↔ **Pyodide Runtime**
- **Event-Driven**: All interactions flow through EventBus
- **Worker-Based**: Compute-intensive tasks isolated in Web Workers
- **Plugin-Native**: MCP and Python integrate seamlessly with existing plugin system

---

## Risk Mitigation

### **Technical Risks**
- **Pyodide Performance**: Large Python runtime (~50MB). *Mitigation*: Lazy loading, worker isolation
- **MCP Complexity**: Protocol implementation challenges. *Mitigation*: Start with simple tool calling, iterate
- **WebLLM Memory**: Function calling increases memory usage. *Mitigation*: Tool result pruning, context management

### **Integration Risks**
- **Plugin Compatibility**: Existing plugins may need API updates. *Mitigation*: Backward-compatible API extensions
- **Performance Impact**: Multiple workers may slow down system. *Mitigation*: Worker pooling, resource monitoring

This roadmap transforms the Desktop Dreamscape into a truly **AI-native operating environment** where natural language becomes the primary interface for desktop automation and Python scripting provides unlimited extensibility.
