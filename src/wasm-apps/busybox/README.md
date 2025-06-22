# BusyBox WASM Port

This directory contains a WebAssembly port of BusyBox utilities.

## Building

Requirements:
- Emscripten SDK
- BusyBox source code

## Available Commands

When built, this will provide common UNIX utilities:
- ls, cat, echo, grep, find
- sh (simple shell)
- cp, mv, rm, mkdir, rmdir
- head, tail, wc, sort

## Integration

The BusyBox WASM module integrates with the core system bus to provide
file system operations and process management.

## Usage

```c
// Load and run a BusyBox command
int busybox_main(int argc, char** argv);
```

The commands are dispatched based on argv[0] (the command name).
