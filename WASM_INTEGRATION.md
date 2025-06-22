# WASM Kernel Integration Guide

This guide shows how to integrate and use the WASM kernel in your React desktop application.

## 🏗️ Architecture Overview

The WASM kernel integration follows your existing provider pattern:

```
App.tsx
├── ThemeProvider
├── WasmKernelProvider  ← New WASM integration
│   ├── Filesystem API
│   ├── Event Bus
│   ├── PTY Interface
│   └── Process Management
└── WindowDndContext
    └── Desktop Components
```

## 🚀 Quick Start

### 1. The WASM kernel is already integrated into your app providers:

```tsx
// In App.tsx - already done
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WasmKernelProvider>  {/* ← WASM kernel provider */}
        <WindowDndContext>{children}</WindowDndContext>
      </WasmKernelProvider>
    </ThemeProvider>
  );
}
```

### 2. Use the WASM kernel in any component:

```tsx
import { useWasmKernel } from '@/hooks/useWasmKernel';

function MyComponent() {
  const { state, api } = useWasmKernel();

  // Check if kernel is ready
  if (!state.isInitialized) {
    return <div>Loading WASM kernel...</div>;
  }

  // Use the filesystem API
  const saveFile = async () => {
    const data = new TextEncoder().encode('Hello World!');
    await api.writeFile('/home/documents/hello.txt', data);
  };

  return <button onClick={saveFile}>Save File</button>;
}
```

## 📁 Filesystem API

The WASM kernel provides a full filesystem interface:

### File Operations

```tsx
const { api } = useWasmKernel();

// Write a file (crash-safe with atomic rename)
const data = new TextEncoder().encode('File content');
await api.writeFile('/home/documents/file.txt', data);

// Read a file
const fileData = await api.readFile('/home/documents/file.txt');
const content = new TextDecoder().decode(fileData);

// Delete a file
await api.deleteFile('/home/documents/file.txt');

// Rename a file
await api.renameFile('/home/old.txt', '/home/new.txt');
```

### Directory Operations

```tsx
// Create a directory
await api.createDir('/home/projects');

// List directory contents
const files = await api.listDir('/home/documents');
console.log('Files:', files); // ['file1.txt', 'file2.txt']
```

### Real-time Events

```tsx
useEffect(() => {
  if (!api) return;

  const unsubscribe = api.onFileSystemEvent((event) => {
    console.log('Filesystem event:', {
      type: event.type,        // 'FS_WRITE', 'FS_DELETE', etc.
      path: event.path,        // '/home/documents/file.txt'
      timestamp: event.seq     // Event sequence number
    });
  });

  return unsubscribe; // Cleanup listener
}, [api]);
```

## 🖥️ Available Filesystems

The kernel automatically mounts several filesystems:

- **`/home`** - Persistent storage (OPFS in browsers)
- **`/tmp`** - Volatile memory storage
- **`/proc`** - Process information (read-only)

## ⚡ Process Management

```tsx
// Get process statistics
const procStat = await api.getProcStat();
console.log('Processes:', procStat.processes);
console.log('Uptime:', procStat.uptime);
```

## 🔧 Terminal Interface (PTY)

```tsx
// Write to terminal
await api.ptyWrite('ls -la\n');

// Read terminal output
const output = await api.ptyRead();
console.log('Terminal output:', output);
```

## 🎯 Integration Examples

### File Manager Component

```tsx
function FileManager() {
  const { api, state } = useWasmKernel();
  const [files, setFiles] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('/home');

  const loadFiles = async () => {
    if (!api) return;
    try {
      const fileList = await api.listDir(currentPath);
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [currentPath, api]);

  const createFile = async (name: string, content: string) => {
    if (!api) return;
    const data = new TextEncoder().encode(content);
    await api.writeFile(\`\${currentPath}/\${name}\`, data);
    loadFiles(); // Refresh file list
  };

  if (!state.isInitialized) {
    return <div>Initializing filesystem...</div>;
  }

  return (
    <div>
      <h2>Files in {currentPath}</h2>
      <ul>
        {files.map(file => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Text Editor with Auto-save

```tsx
function TextEditor({ filePath }: { filePath: string }) {
  const { api } = useWasmKernel();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load file on mount
  useEffect(() => {
    const loadFile = async () => {
      if (!api) return;
      try {
        const data = await api.readFile(filePath);
        setContent(new TextDecoder().decode(data));
      } catch (error) {
        console.log('New file');
      } finally {
        setIsLoading(false);
      }
    };
    loadFile();
  }, [filePath, api]);

  // Auto-save on content change
  useEffect(() => {
    if (isLoading || !api) return;
    
    const saveTimeout = setTimeout(async () => {
      const data = new TextEncoder().encode(content);
      await api.writeFile(filePath, data);
      console.log('Auto-saved');
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [content, filePath, api, isLoading]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      className="w-full h-96 p-4 border rounded"
    />
  );
}
```

## 🧪 Testing the Integration

A demo component is included to test the WASM kernel:

```tsx
import { WasmKernelDemo } from '@/components/WasmKernelDemo';

// Add to any page to test functionality
<WasmKernelDemo />
```

The demo tests:
- ✅ File creation, reading, writing
- ✅ Directory operations
- ✅ File renaming and deletion
- ✅ Event system
- ✅ Process statistics

## 🔍 Error Handling

```tsx
const { state, api } = useWasmKernel();

// Check kernel status
if (state.error) {
  return <div>Kernel error: {state.error}</div>;
}

if (state.isLoading) {
  return <div>Loading kernel...</div>;
}

// Wrap API calls in try-catch
try {
  await api.writeFile('/home/test.txt', data);
} catch (error) {
  console.error('File operation failed:', error);
}
```

## 🚀 Performance Tips

1. **Batch Operations**: Group multiple file operations together
2. **Event Debouncing**: Debounce rapid filesystem events
3. **Lazy Loading**: Only initialize kernel when needed
4. **Memory Management**: Clean up event listeners properly

## 🔗 Integration with Existing Systems

The WASM kernel integrates seamlessly with your existing:

- **Window Management**: Save/restore window states to `/home/config/`
- **Theme System**: Store theme preferences in kernel filesystem
- **Plugin System**: Plugins can use the filesystem for data persistence
- **API System**: Bridge WASM filesystem with external APIs

## 🎯 Next Steps

1. **Add to Desktop.tsx**: Integrate filesystem into your main desktop component
2. **Window Persistence**: Save window positions/states using the kernel
3. **App Data**: Store application data in `/home/apps/`
4. **Custom File Types**: Create handlers for specific file extensions
5. **Virtual Apps**: Build apps that run entirely in the WASM filesystem

The WASM kernel is now ready to power your desktop environment with persistent storage, real-time events, and full filesystem capabilities!
