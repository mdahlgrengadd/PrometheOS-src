# Roadmap: Model Context Protocol (MCP) Integration with Pyodide/Python Scripting

## 🚀 **MAJOR MILESTONE ACHIEVED** - May 2025

### ✅ **Phase 1 FULLY COMPLETED** *(Phase 1.1 & 1.2)*
- **🎉 Python-Desktop API Bridge OPERATIONAL** 🎉
  - ✅ **HybridDesktopApiBridge**: Dual Comlink + MCP protocol support implemented
  - ✅ **Full Python Integration**: `desktop.api.execute()`, `list_components()`, event system working
  - ✅ **End-to-End Testing**: All API components (notepad, calculator, launcher) callable from Python
  - ✅ **Robust Architecture**: Promise-based async/await support with proper error handling
  - ✅ **Message Channel Communication**: postMessage bridge for MCP protocol compatibility

### ✅ **Phase 2.1 FOUNDATION COMPLETED** *(MCP Infrastructure)*
- **🔥 MCP Server Worker**: Production-ready implementation
  - ✅ **Auto-Registration**: API components automatically become MCP tools
  - ✅ **JSON-RPC 2.0 Protocol**: Standards-compliant message handling
  - ✅ **Tool Discovery**: `tools/list` endpoint with full schema generation
  - ✅ **Tool Execution**: `tools/call` endpoint with parameter validation
  - ✅ **Component Lifecycle**: Auto-register/unregister as plugins load/unload

### 🔶 **Current Priority**: Phase 2.2 - WebLLM Function Calling Integration
- Connect MCP tools to WebLLM chat interface for AI-driven desktop automation
- Implement tool result display and multi-step workflows
- Add conversational desktop control through natural language

---

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

### **Phase 1: Pyodide Foundation** *(Sprints 1.1-1.2)* ✅ **COMPLETED**

#### **Sprint 1.1: Pyodide Worker Setup** ✅ **COMPLETED**
**Duration**: 3-4 days *(Completed)*
**Deliverables**:
- ✅ Create `PyodideWorkerPlugin` in `src/worker/plugins/pyodide.ts`
- ✅ Setup Pyodide initialization with standard library + `micropip`
- ✅ Basic Python code execution with result serialization
- ✅ Error handling and timeout management
- ✅ **Fixed ES Module compatibility** - Replaced `importScripts()` with fetch-based approach
- ✅ **Removed invalid package dependency** - Removed "json" from loadPackage (built-in to Python)

**Technical Notes**:
- ✅ Follow existing worker plugin pattern (see `webllm.ts`)
- ✅ Use Comlink for Python execution API
- ✅ Include `asyncio`, `json`, `urllib` in Pyodide environment
- ✅ **ES Module Worker Support** - Compatible with modern worker module system

#### **Sprint 1.2: Python-Desktop API Bridge** ✅ **COMPLETED**
**Duration**: 4-5 days *(Completed May 2025)*
**Deliverables**:
- ✅ **Pyodide Test App**: Full Python REPL with desktop API integration (`src/plugins/apps/pyodide-test/`)
- ✅ **HybridDesktopApiBridge**: Dual interface supporting both Comlink and MCP protocols
- ✅ **Python Desktop Module**: `desktop.api.list_components()`, `desktop.api.execute()` fully functional
- ✅ **Event System Integration**: `desktop.events.subscribe()`, `desktop.events.emit()` working
- ✅ **Message Channel Architecture**: postMessage bridge for MCP JSON-RPC 2.0 compatibility
- ✅ **Comprehensive Testing**: All system APIs (launcher, dialog, notepad, calculator) verified from Python

**Technical Achievements**:
- ✅ **Promise-based async/await**: Natural Python syntax for desktop API calls
- ✅ **Error Handling**: Robust exception handling with detailed error messages  
- ✅ **Data Serialization**: Proper JS↔Python object conversion using `to_js()`
- ✅ **Worker Isolation**: Full Python runtime in dedicated Web Worker thread

### **Phase 2: MCP Server Infrastructure** *(Sprints 2.1-2.2)* ✅ **2.1 COMPLETED**, 🔶 **2.2 IN PROGRESS**

#### **Sprint 2.1: MCP Protocol Implementation** ✅ **COMPLETED**
**Duration**: 5-6 days *(Completed May 2025)*
**Deliverables**:
- ✅ **MCP Server Worker**: Full production implementation (`src/worker/plugins/mcp-server.ts`)
- ✅ **Auto-Registration**: API components automatically become MCP tools on registration
- ✅ **JSON-RPC 2.0 Protocol**: Complete standards-compliant message handler
- ✅ **Tool Schema Generation**: Automatic OpenAPI → MCP tool conversion
- ✅ **Tool Discovery**: `tools/list` endpoint returning all available desktop tools
- ✅ **Tool Execution**: `tools/call` endpoint with parameter validation and real execution
- ✅ **Resource API**: `resources/list` and `resources/read` for MCP resource protocol
- ✅ **Component Lifecycle**: Automatic tool registration/unregistration as plugins load/unload

**Technical Achievements**:
- ✅ **Production-Ready Architecture**: Robust error handling and logging
- ✅ **Schema Validation**: Full parameter type checking and required field validation
- ✅ **API Integration**: Seamless connection to existing Desktop API system
- ✅ **Performance Optimized**: Efficient tool lookup and execution

**Current Status**:
- ✅ **Infrastructure Complete**: All core MCP protocol endpoints implemented
- ✅ **Tool Registration**: 6+ system tools automatically available (launcher, dialog, notepad, calculator, etc.)
- ✅ **Real Execution**: Tool calls execute actual desktop actions with real results
- ✅ **Standards Compliant**: Full JSON-RPC 2.0 and MCP specification adherence

#### **Sprint 2.2: WebLLM Function Calling Integration** 🔶 **IN PROGRESS**
**Duration**: 4-5 days *(Current Priority)*
**Deliverables**:
- 🔶 **WebLLM Tool Support**: Extend WebLLM worker to support function calling
- 🔶 **MCP Tool Integration**: Pass MCP tools to model context for function calling
- 🔶 **Tool Call UI**: Display tool executions and results in chat interface
- 🔶 **Multi-Step Workflows**: Support for complex tool sequences

**Current MCP Tool Categories Available**:
- ✅ **System Tools**: `launcher.launchApp`, `launcher.killApp`, `launcher.notify`, `dialog.openDialog`
- ✅ **Event Tools**: `event.listEvents`, `onEvent.waitForEvent` 
- ✅ **App Tools**: `notepad.setValue`, `notepad.getValue`, `notepad.clear`, `notepad.appendText`
- 🔶 **WebLLM Integration**: Function calling from chat interface **(Next Priority)**

### **Phase 3: WebLLM Function Calling** *(Sprints 3.1-3.2)* 🔶 **FOUNDATION READY**

#### **Sprint 3.1: WebLLM-MCP Integration** 🔶 **NEXT PRIORITY**
**Duration**: 6-7 days *(Current Focus)*
**Deliverables**:
- 🔶 **WebLLM Function Calling**: Extend existing WebLLM worker with MCP tool support
- 🔶 **Tool Context Integration**: Automatic MCP tool discovery and context injection
- 🔶 **Chat Interface Enhancement**: Display tool calls and results in conversation
- 🔶 **Tool Call Execution**: Parse LLM tool calls and execute via MCP server

**Foundation Ready**:
- ✅ **WebLLM Worker**: Production-ready streaming chat implementation
- ✅ **MCP Server**: Complete tool registry with 6+ desktop tools available
- ✅ **API Infrastructure**: All components exposed via MCP protocol
- ✅ **Worker Communication**: Comlink-based inter-worker messaging established

**Architecture Plan**:
```typescript
// WebLLM enhanced with MCP tools (to be implemented)
const mcpTools = await workerManager.callPlugin('mcp-server', 'listTools');
const response = await engine.chat.completions.create({
  messages,
  tools: mcpTools,
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

| Phase | Sprint | Duration | Goal | Status |
|-------|--------|----------|------|--------|
| 1 | 1.1 | 3-4 days | Pyodide Worker Setup | ✅ **COMPLETED** |
| 1 | 1.2 | 4-5 days | Python-Desktop API Bridge | ✅ **COMPLETED** |
| 2 | 2.1 | 5-6 days | MCP Protocol Implementation | ✅ **COMPLETED** |
| 2 | 2.2 | 4-5 days | WebLLM Function Calling | 🔶 **IN PROGRESS** |
| 3 | 3.1 | 6-7 days | Advanced Function Patterns | ⏳ **READY** |
| 3 | 3.2 | 4-5 days | Tool UI & Workflows | ⏳ **PENDING** |
| 4 | 4.1 | 5-6 days | Python Script Management | ⏳ **PENDING** |
| 4 | 4.2 | 6-7 days | Advanced Python Capabilities | ⏳ **PENDING** |
| 5 | 5.1 | 4-5 days | End-to-End Integration | ⏳ **PENDING** |
| 5 | 5.2 | 3-4 days | Documentation & Testing | ⏳ **PENDING** |

**Total Estimated Duration**: 45-54 days (9-11 weeks)  
**Completed**: 3.5/10 sprints (35%) - **MAJOR PROGRESS** 🚀
- ✅ **Phase 1 Complete**: Full Python-Desktop API integration  
- ✅ **Phase 2.1 Complete**: Production MCP server with tool registry
- 🔶 **Phase 2.2 Active**: WebLLM function calling integration

**Next Critical Milestone**: Complete WebLLM-MCP integration for AI-driven desktop automation

---

## 🎯 **CURRENT IMPLEMENTATION STATUS** - May 2025

### ✅ **COMPLETED ACHIEVEMENTS**

#### **🔥 Python-Desktop API Bridge - PRODUCTION READY**
- **Full Integration**: Python scripts can call any desktop API with `await desktop.api.execute()`
- **Event System**: Bidirectional event subscription/emission between Python and desktop
- **Robust Architecture**: Promise-based async/await with comprehensive error handling
- **Testing Verified**: All system APIs (launcher, notepad, calculator, dialog) working from Python

#### **🔥 MCP Server Infrastructure - FULLY OPERATIONAL**  
- **Auto-Registration**: API components automatically become MCP tools on plugin load
- **Standards Compliant**: Full JSON-RPC 2.0 and MCP protocol implementation
- **Tool Discovery**: `tools/list` endpoint with complete schema generation
- **Tool Execution**: `tools/call` endpoint executing real desktop actions
- **Resource API**: `resources/list` and `resources/read` for MCP resource protocol
- **6+ Active Tools**: System tools (launcher, dialog, events, notepad) ready for AI consumption

### 🔶 **NEXT CRITICAL MILESTONE**: WebLLM Function Calling

#### **Current Focus - Sprint 2.2**
**Goal**: Enable WebLLM to discover and call desktop tools through natural language

**Implementation Plan**:
1. **Tool Context Injection**: Pass MCP tools to WebLLM model context
2. **Function Call Parsing**: Parse LLM tool calls and route to MCP server  
3. **Result Integration**: Display tool execution results in chat conversation
4. **Error Handling**: Graceful handling of tool call failures

**Expected Timeline**: 4-5 days to complete WebLLM-MCP integration

### 🚀 **BREAKTHROUGH ACHIEVED**

The project has reached a **major architectural milestone**:
- ✅ **Python Runtime**: Full Pyodide integration with desktop APIs
- ✅ **MCP Protocol**: Standards-compliant tool server with real desktop integration  
- ✅ **API System**: Comprehensive component registration and action handling
- ✅ **Worker Architecture**: Isolated compute for Python, WebLLM, and MCP server

**This represents the foundation for AI-native desktop automation.** The next phase will unlock conversational desktop control through natural language.

---

## 🎯 **ARCHITECTURE OVERVIEW** - Current State

### **Completed Infrastructure** ✅

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Python        │    │   MCP Server     │    │  Desktop APIs   │
│   (Pyodide)     │◄──►│   Worker         │◄──►│   Components    │
│                 │    │                  │    │                 │
│ • API Calls     │    │ • Tool Registry  │    │ • Notepad       │
│ • Event System  │    │ • JSON-RPC 2.0   │    │ • Calculator    │
│ • Async/Await   │    │ • Auto-Register  │    │ • Launcher      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EventBus + API Context                      │
│               (Central Communication Hub)                      │
└─────────────────────────────────────────────────────────────────┘
```

### **Next Integration** 🔶

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WebLLM        │    │   MCP Server     │    │  Desktop APIs   │
│   Chat Worker   │◄──►│   Worker         │◄──►│   Components    │
│                 │    │                  │    │                 │
│ • Function Call │    │ • Tool Discovery │    │ • Real Actions  │
│ • Tool Context  │    │ • Tool Execution │    │ • Live Results  │
│ • Natural Lang  │    │ • Result Format  │    │ • State Updates │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Vision**: User asks WebLLM "Create a note with today's weather" → WebLLM calls `notepad.setValue` tool → Real notepad opens with content

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
