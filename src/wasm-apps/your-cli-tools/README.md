# CLI Tools Collection

This directory contains various command-line tools compiled to WebAssembly.

## Tools Included

- **nano-editor**: Simple text editor
- **file-utils**: File manipulation utilities  
- **text-utils**: Text processing tools
- **dev-tools**: Development utilities

## Building

Each tool can be built independently using Emscripten:

```bash
emcc tool.c -o tool.js -s EXPORTED_FUNCTIONS='["_main"]'
```

## Integration

All tools use the core system bus for:

- File system operations
- Process management  
- Inter-process communication

## Usage

Tools can be invoked from the shell or programmatically:

```c
// Execute a CLI tool
int execute_tool(const char* tool_name, int argc, char** argv);
```
