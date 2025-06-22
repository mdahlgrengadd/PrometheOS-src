# Minimal WASM Kernel

A lightweight WebAssembly kernel implementing a filesystem layer with crash-safe writes, process table, and event bus for browser-based desktop environments.

## Features

- **Filesystem**: WasmFS with OPFS mount at `/home` (persistent) and MemFS at `/tmp` (volatile)
- **Crash-safe writes**: Atomic write operations using temp files and rename
- **Event bus**: Fixed-width message protocol with 5 message types
- **PTY**: Minimal 20-line `/dev/tty1` implementation with ring buffers
- **Process table**: Static array exposed via `/proc/stat`
- **Threading**: Built with pthreads support for multi-worker access
- **Size optimized**: Target ≤250KB gzipped

## Build Requirements

- Emscripten SDK 3.1.71+
- Node.js 16+ (for build scripts)
- Make (for build system)

## Quick Start

```bash
# Build the kernel
npm run build:wasm

# Or build manually
cd src/core
make optimize
make install

# Generate OpenAPI spec
node scripts/gen-openapi.mjs
```

## Architecture

### Message Types (Fixed ABI)

```c
typedef enum {
    FS_READ = 1,     // Read data from filesystem
    FS_WRITE = 2,    // Write data with crash-safe semantics  
    FS_RENAME = 3,   // Atomically rename file/directory
    FS_DELETE = 4,   // Delete file/directory
    FS_CHANGED = 5   // Filesystem change notification
} fs_msg_type_t;
```

### Message Header (32 bytes)

```c
typedef struct {
    uint8_t version;     // ABI version (1)
    uint8_t type;        // fs_msg_type_t
    uint16_t flags;      // Operation flags
    uint32_t seq;        // Sequence number
    uint32_t data_len;   // Data payload length
    char path[20];       // Path (truncated if needed)
} bus_msg_t;
```

### Filesystem Layout

```
/
├── home/          # OPFS persistent storage
│   └── .tmp/      # Temporary files for atomic writes
├── tmp/           # MemFS volatile storage  
└── proc/
    └── stat       # Process table (read-only)
```

## Integration

### JavaScript Interface

```javascript
// Load the kernel
const WasmCore = await import('/dist/wasm/core.js');
const kernel = await WasmCore.default();

// Initialize
kernel._main();
```

Current size: ~180KB gzipped (target: ≤250KB)
