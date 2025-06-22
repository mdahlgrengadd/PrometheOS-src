# WASM Kernel Demo Plugin

## Overview

The WASM Kernel Demo is a first-class desktop application plugin that showcases a minimal C → WebAssembly kernel with comprehensive system-level features. This plugin demonstrates the integration of a low-level WASM kernel with a modern React-based desktop environment.

## Features

### Core WASM Kernel
- **Emscripten WasmFS**: Virtual file system with POSIX-like operations
- **POSIX I/O**: Standard file operations (read, write, create, delete, rename)
- **Event Bus ABI**: Inter-component communication system
- **Crash-safe writes**: Atomic file operations with temporary files and fsync
- **PTY Support**: Pseudo-terminal interface for command execution
- **Process Table**: Process management and statistics

### Desktop Integration
- **Plugin Architecture**: Seamlessly integrated as a desktop application
- **Window Management**: Full window controls (minimize, maximize, close)
- **Menu System**: Native-style application menubar
- **Responsive UI**: Modern React interface with Tailwind CSS styling
- **Shadow File System**: Desktop shortcuts in virtual file system

## Technical Details

### Build System
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Emscripten Toolchain**: Modern WebAssembly compilation
- **Size Optimized**: Target ≤250kB gzipped
- **Development/Production**: Automated build pipeline

### File Structure
```
src/plugins/apps/wasm-kernel/
├── index.tsx          # Plugin entry point
├── manifest.tsx       # Plugin metadata
└── ui.tsx            # Main React component

src/core/             # C kernel source
├── main.c           # Kernel entry point
├── fs.c             # File system operations
├── pty.c            # PTY implementation
├── proc.c           # Process management
├── bus.c            # Event bus
└── include/         # Header files

public/wasm/         # Built WASM files
├── core.wasm       # WebAssembly binary
└── core.js         # Emscripten loader

public/shadow/Desktop/
└── WASM Kernel Demo.json  # Desktop shortcut
```

## Usage

### Opening the Plugin
1. Click the "WASM Kernel Demo" icon on the desktop
2. Or select from the application menu
3. The plugin window will open with the kernel interface

### Testing Operations
The plugin provides several test suites:

#### File Operations Test
- Creates directories and files
- Demonstrates atomic writes
- Shows directory listing
- Tests file renaming

#### PTY Operations Test
- Sends commands to pseudo-terminal
- Reads command output
- Demonstrates shell-like interface

#### Process Statistics Test
- Retrieves kernel process information
- Shows memory and CPU usage
- Displays process table

### Menu Options
- **Tests Menu**:
  - Run All Tests: Execute comprehensive test suite
  - File Operations: Test file system only
  - PTY Operations: Test terminal interface
  - Process Stats: Show process information
  - Clear Results: Reset test output

- **About Menu**:
  - WASM Kernel Info: Technical details
  - Component information

## Development

### Building the Kernel
```bash
# Build WASM kernel and install to public directory
npm run build:wasm

# Or manually
node scripts/build-wasm-core.mjs
```

### Development Server
```bash
# Start development server (includes WASM build)
npm run dev
```

### Production Build
```bash
# Full production build
npm run build
```

## Integration Details

### Plugin Registration
The plugin is registered in:
- `src/plugins/registry.tsx`: Static plugin list
- `src/plugins/PluginContext.tsx`: Plugin loader and manifest map

### WASM Provider
The plugin uses the global `WasmKernelProvider` context:
- Initialized in `src/App.tsx`
- Provides kernel API to all components
- Handles WASM module loading and lifecycle

### Shadow System
Desktop shortcuts are automatically created:
- `public/shadow/Desktop/WASM Kernel Demo.json`
- `public/shadow/Downloads/WASM Kernel Demo.json`

## API Reference

### WASM Kernel API
The plugin uses the `useWasmKernel` hook which provides:

```typescript
interface WasmKernelAPI {
  // File operations
  writeFile(path: string, data: Uint8Array): Promise<void>
  readFile(path: string): Promise<Uint8Array>
  createDir(path: string): Promise<void>
  listDir(path: string): Promise<string[]>
  renameFile(oldPath: string, newPath: string): Promise<void>
  
  // PTY operations
  ptyWrite(command: string): Promise<void>
  ptyRead(): Promise<string>
  
  // Process management
  getProcStat(): Promise<ProcStat>
  
  // Event system
  onFileSystemEvent(callback: (event: FSMessage) => void): () => void
}
```

### Plugin Interface
The plugin implements the standard plugin interface:

```typescript
interface Plugin {
  id: string
  manifest: PluginManifest
  init: (initData?: PluginInitData) => Promise<void> | void
  render: () => React.ReactNode
  onOpen?: (initData?: PluginInitData) => void
  onClose?: () => void
  // ... other lifecycle methods
}
```

## Performance

### WASM Kernel Size
- Core WASM binary: ~232KB
- JavaScript loader: ~99KB
- Total (uncompressed): ~331KB
- **Target: ≤250KB gzipped** ✅

### Memory Usage
- Initial memory: 1MB
- Stack size: 64KB
- Memory growth: Allowed as needed
- Async support: Enabled via ASYNCIFY

## Troubleshooting

### Common Issues

1. **WASM Module Not Loading**
   - Check browser console for errors
   - Verify Emscripten SDK is installed
   - Ensure files are served correctly

2. **File Operations Failing**
   - Check WasmFS initialization
   - Verify mount points are created
   - Look for OPFS limitations (main thread)

3. **Plugin Not Appearing**
   - Check plugin registration in registry.tsx
   - Verify PluginContext.tsx includes the plugin
   - Check shadow shortcuts are created

### Debug Mode
Enable debug logging by opening browser console:
```javascript
// Check WASM kernel status
window.wasmKernel?.getState()

// Test file operations directly
window.wasmKernel?.api?.listDir('/home')
```

## Future Enhancements

- [ ] OPFS backend integration (worker thread)
- [ ] Advanced PTY features (colors, escape codes)
- [ ] Process isolation and sandboxing
- [ ] Network I/O support
- [ ] Inter-process communication
- [ ] Real-time performance monitoring
- [ ] Plugin-to-kernel API extensions

## License

Part of the draggable-desktop-dreamscape project.
