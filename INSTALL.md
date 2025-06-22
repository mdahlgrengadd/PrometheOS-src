# Installation Guide - WASM Kernel

This guide covers how to build the minimal C → WebAssembly kernel for the browser-desktop project.

## Prerequisites

### Emscripten SDK
The WASM kernel requires the Emscripten SDK to compile C code to WebAssembly.

#### Windows Installation
1. Download the latest Emscripten SDK:
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ```

2. Install and activate the latest version:
   ```cmd
   emsdk install latest
   emsdk activate latest
   emsdk_env.bat
   ```

3. Verify installation:
   ```cmd
   emcc --version
   ```

#### Linux/macOS Installation
1. Download and install:
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

2. Add to your shell profile (optional):
   ```bash
   echo 'source /path/to/emsdk/emsdk_env.sh' >> ~/.bashrc
   ```

### Node.js (Optional)
For automated build scripts and OpenAPI generation:
- Node.js 16+ recommended
- Download from [nodejs.org](https://nodejs.org/)

## Build Methods

### Method 1: Automated Build Script (Recommended)

The easiest way to build the WASM kernel:

```bash
# From project root
node scripts/build-wasm-core.mjs
```

This script will:
- ✅ Check for Emscripten availability
- ✅ Compile all C source files
- ✅ Link the final WASM binary
- ✅ Copy files to `dist/wasm/`
- ✅ Generate OpenAPI specification
- ✅ Verify size constraints (≤250KB target)

### Method 2: Platform-Specific Build Scripts

#### Windows (build.bat)
```cmd
cd src\core
.\build.bat
```

#### Linux/macOS (Makefile)
```bash
cd src/core
make optimize
```

### Method 3: Manual Compilation

If you need full control over the build process:

#### Step 1: Compile Object Files
```bash
cd src/core

# Compile each source file
emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c main.c -o main.o
emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c fs.c -o fs.o
emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c pty.c -o pty.o
emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c bus.c -o bus.o
emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c proc.c -o proc.o
```

#### Step 2: Link Final Binary
```bash
emcc main.o fs.o pty.o bus.o proc.o -o core.js \
    -sWASMFS=1 \
    -sUSE_PTHREADS=1 \
    -sPTHREAD_POOL_SIZE=4 \
    -sEXPORTED_FUNCTIONS='["_main"]' \
    -sEXPORTED_RUNTIME_METHODS='[]' \
    -sALLOW_MEMORY_GROWTH=1 \
    -sINITIAL_MEMORY=1MB \
    -sSTACK_SIZE=64KB \
    -sNO_DYNAMIC_EXECUTION=1 \
    -sMODULARIZE=1 \
    -sEXPORT_NAME=WasmCore \
    -flto
```

## Build Output

A successful build produces:

```
src/core/
├── core.wasm          # WebAssembly binary (~104KB)
├── core.js            # JavaScript glue code (~125KB)
└── *.o                # Intermediate object files

public/wasm/           # Static assets for serving
├── core.wasm          # Final WASM binary
└── core.js            # Final JS glue code

dist/wasm/             # Distribution files (copied during build)
├── core.wasm          # Final WASM binary
└── core.js            # Final JS glue code

openapi/
└── desktop.yaml       # Generated API specification
```

## Build Flags Explained

| Flag | Purpose |
|------|---------|
| `-O3` | Maximum optimization |
| `-flto` | Link-time optimization |
| `-DNDEBUG` | Release build (no debug assertions) |
| `-sWASMFS=1` | Enable WasmFS filesystem |
| `-sUSE_PTHREADS=1` | Enable pthread support |
| `-sPTHREAD_POOL_SIZE=4` | Worker thread pool size |
| `-sALLOW_MEMORY_GROWTH=1` | Dynamic memory allocation |
| `-sINITIAL_MEMORY=1MB` | Starting memory size |
| `-sSTACK_SIZE=64KB` | Thread stack size |
| `-sMODULARIZE=1` | ES6 module output |
| `-sEXPORT_NAME=WasmCore` | Module name |

## Size Requirements

The kernel must meet strict size constraints:

- **Target**: ≤ 250KB total (gzipped)
- **Current**: ~229KB total
  - core.wasm: ~104KB
  - core.js: ~125KB

## Troubleshooting

### Common Issues

#### "emcc: command not found"
**Solution**: Emscripten SDK not installed or not activated
```bash
# Reactivate Emscripten environment
cd /path/to/emsdk
source ./emsdk_env.sh    # Linux/macOS
# or
emsdk_env.bat           # Windows
```

#### "undefined exported symbol: _main"
**Solution**: Check export function syntax
- Ensure quotes are properly escaped: `"[\"_main\"]"`
- Use single quotes in shell: `'["_main"]'`

#### "Closure compiler run failed"
**Solution**: Remove `--closure 1` flag for now
- Closure optimization has compatibility issues
- Build script automatically removes it

#### Build hangs on Windows
**Solution**: Use PowerShell or run individual commands
```powershell
# Individual compilation
foreach ($src in @('main.c','fs.c','pty.c','bus.c','proc.c')) { 
    $obj = $src -replace '\.c$', '.o'
    emcc -O3 -flto -DNDEBUG -Wall -Wextra -I. -c $src -o $obj 
}
```

### Build Verification

Check if build was successful:

```bash
# Verify files exist
ls -la src/core/core.{wasm,js}
ls -la dist/wasm/core.{wasm,js}

# Check file sizes
du -h src/core/core.wasm src/core/core.js

# Test WASM module (Node.js)
node -e "const m = require('./dist/wasm/core.js'); console.log('Module loaded:', typeof m.WasmCore)"
```

## Integration

After building, the WASM kernel can be integrated into your web application:

```javascript
// ES6 Module import
import WasmCore from './dist/wasm/core.js';

// Initialize the kernel
const wasmModule = await WasmCore();

// The kernel will automatically:
// - Mount filesystems (/home with OPFS, /tmp with MemFS)
// - Initialize event bus and PTY
// - Start the main event processing loop
```

## Development

For development and testing:

```bash
# Watch mode (rebuild on changes)
cd src/core
make watch

# Debug build (larger but with symbols)
make debug

# Clean build artifacts
make clean
```

## Next Steps

1. **Integration Testing**: Load the WASM module in a browser
2. **API Testing**: Send events via the OpenAPI specification
3. **Performance Testing**: Verify filesystem operations
4. **Size Optimization**: Further reduce bundle size if needed

For more details on the kernel architecture, see [src/core/README.md](src/core/README.md).
