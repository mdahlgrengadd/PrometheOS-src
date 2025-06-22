import {
    CheckCircle, FileText, Folder, Info, Loader2, Play, Square, Terminal, XCircle
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger
} from '@/components/ui/menubar';
import {
    WindowsMenubar, WindowsMenubarContent, WindowsMenubarTrigger
} from '@/components/ui/windows';
import { useWasmKernel } from '@/hooks/useWasmKernel';

import { Plugin, PluginInitData } from '../../../plugins/types';
import { Terminal as TerminalComponent } from './components/Terminal';
import { manifest } from './manifest';

const WasmKernelDemoComponent: React.FC<{ initData?: PluginInitData }> = ({
  initData,
}) => {
  const { state, api } = useWasmKernel();
  const [fileList, setFileList] = React.useState<string[]>([]);
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = React.useState(false);

  const addTestResult = React.useCallback((message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  const clearResults = React.useCallback(() => {
    setTestResults([]);
    setFileList([]);
  }, []);

  const testFileOperations = React.useCallback(async () => {
    if (!api || isRunningTests) return;

    setIsRunningTests(true);
    try {
      addTestResult("🧪 Starting comprehensive file operation tests...");

      // Test 1: Create a directory
      await api.createDir("/home/test");
      addTestResult("✅ Created directory /home/test");

      // Test 2: Write a file
      const testData = new TextEncoder().encode(
        "Hello from WASM Kernel!\nThis is a test file created by the WASM kernel demo."
      );
      await api.writeFile("/home/test/hello.txt", testData);
      addTestResult("✅ Written file /home/test/hello.txt");

      // Test 3: Read the file back
      const readData = await api.readFile("/home/test/hello.txt");
      const content = new TextDecoder().decode(readData);
      addTestResult(`✅ Read file content: "${content.slice(0, 50)}..."`);

      // Test 4: Create another file
      const jsonData = new TextEncoder().encode(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            kernel: "WASM Core",
            test: "JSON serialization",
          },
          null,
          2
        )
      );
      await api.writeFile("/home/test/data.json", jsonData);
      addTestResult("✅ Created JSON data file");

      // Test 5: List directory
      const files = await api.listDir("/home/test");
      setFileList(files);
      addTestResult(`✅ Listed directory: ${files.join(", ")}`);

      // Test 6: Rename file
      await api.renameFile("/home/test/hello.txt", "/home/test/greeting.txt");
      addTestResult("✅ Renamed file to greeting.txt");

      // Test 7: List directory again
      const newFiles = await api.listDir("/home/test");
      setFileList(newFiles);
      addTestResult(`✅ Updated file list: ${newFiles.join(", ")}`);

      // Test 8: Create subdirectory
      await api.createDir("/home/test/subdir");
      await api.writeFile(
        "/home/test/subdir/nested.txt",
        new TextEncoder().encode("Nested file content")
      );
      addTestResult("✅ Created subdirectory with nested file");

      // Test 9: Final directory listing
      const finalFiles = await api.listDir("/home/test");
      setFileList(finalFiles);
      addTestResult(`✅ Final directory contents: ${finalFiles.join(", ")}`);
    } catch (error) {
      addTestResult(`❌ File operation error: ${error}`);
    } finally {
      setIsRunningTests(false);
    }
  }, [api, addTestResult, isRunningTests]);

  const testPtyOperations = React.useCallback(async () => {
    if (!api || isRunningTests) return;

    setIsRunningTests(true);
    try {
      addTestResult("🖥️ Testing PTY operations...");

      // Test PTY write
      await api.ptyWrite("echo 'Hello PTY'\n");
      addTestResult("✅ PTY write command sent");

      // Test PTY read (basic implementation)
      const output = await api.ptyRead();
      addTestResult(`✅ PTY output: "${output}"`);

      // Test multiple commands
      await api.ptyWrite("pwd\n");
      const pwd = await api.ptyRead();
      addTestResult(`✅ Current directory: "${pwd}"`);
    } catch (error) {
      addTestResult(`❌ PTY test failed: ${error}`);
    } finally {
      setIsRunningTests(false);
    }
  }, [api, addTestResult, isRunningTests]);

  const testProcStat = React.useCallback(async () => {
    if (!api || isRunningTests) return;

    setIsRunningTests(true);
    try {
      addTestResult("📊 Testing process statistics...");

      const procStat = await api.getProcStat();
      addTestResult(`✅ Process stats: ${JSON.stringify(procStat, null, 2)}`);
    } catch (error) {
      addTestResult(`⚠️ ProcStat not available: ${error}`);
    } finally {
      setIsRunningTests(false);
    }
  }, [api, addTestResult, isRunningTests]);

  const runAllTests = React.useCallback(async () => {
    if (!api || isRunningTests) return;

    clearResults();
    addTestResult("🚀 Running comprehensive WASM kernel test suite...");

    await testFileOperations();
    await new Promise((resolve) => setTimeout(resolve, 500)); // Brief pause
    await testPtyOperations();
    await new Promise((resolve) => setTimeout(resolve, 500)); // Brief pause
    await testProcStat();

    addTestResult("✨ All tests completed!");
  }, [
    api,
    addTestResult,
    clearResults,
    testFileOperations,
    testPtyOperations,
    testProcStat,
    isRunningTests,
  ]);
  // Listen for filesystem events
  React.useEffect(() => {
    if (!api) return;

    const unsubscribe = api.onFileSystemEvent((event) => {
      setTestResults((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: 📡 FS Event: ${event.type} on ${
          event.path
        }`,
      ]);
    });

    return unsubscribe;
  }, [api]); // Only depend on api

  const getStatusIcon = () => {
    if (state.isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (state.error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (state.isInitialized)
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    return null;
  };

  const getStatusText = () => {
    if (state.isLoading) return "Initializing...";
    if (state.error) return `Error: ${state.error}`;
    if (state.isInitialized) return "Ready";
    return "Not initialized";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top application menubar */}
      <WindowsMenubar>
        <MenubarMenu>
          <WindowsMenubarTrigger
            className="!bg-transparent !border-0"
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
              appearance: "none",
            }}
          >
            Tests
          </WindowsMenubarTrigger>
          <WindowsMenubarContent>
            <MenubarItem
              className="hover:bg-muted"
              onClick={runAllTests}
              disabled={!state.isInitialized || isRunningTests}
            >
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
              <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              className="hover:bg-muted"
              onClick={testFileOperations}
              disabled={!state.isInitialized || isRunningTests}
            >
              <FileText className="h-4 w-4 mr-2" />
              File Operations
            </MenubarItem>
            <MenubarItem
              className="hover:bg-muted"
              onClick={testPtyOperations}
              disabled={!state.isInitialized || isRunningTests}
            >
              <Terminal className="h-4 w-4 mr-2" />
              PTY Operations
            </MenubarItem>
            <MenubarItem
              className="hover:bg-muted"
              onClick={testProcStat}
              disabled={!state.isInitialized || isRunningTests}
            >
              <Info className="h-4 w-4 mr-2" />
              Process Stats
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted" onClick={clearResults}>
              <Square className="h-4 w-4 mr-2" />
              Clear Results
            </MenubarItem>
          </WindowsMenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <WindowsMenubarTrigger
            className="!bg-transparent !border-0"
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
              appearance: "none",
            }}
          >
            About
          </WindowsMenubarTrigger>
          <WindowsMenubarContent>
            <MenubarItem className="hover:bg-muted">
              <Info className="h-4 w-4 mr-2" />
              WASM Kernel Info
            </MenubarItem>
            <MenubarItem className="hover:bg-muted">
              Emscripten WasmFS
            </MenubarItem>
            <MenubarItem className="hover:bg-muted">
              POSIX I/O & PTY
            </MenubarItem>
          </WindowsMenubarContent>
        </MenubarMenu>
      </WindowsMenubar>

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              WASM Kernel Status
            </CardTitle>{" "}
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>Current status:</span>
              <Badge variant={state.isInitialized ? "default" : "secondary"}>
                {getStatusText()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={runAllTests}
                disabled={!state.isInitialized || isRunningTests}
                className="flex items-center gap-2"
                variant={isRunningTests ? "secondary" : "default"}
              >
                {isRunningTests ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunningTests ? "Running Tests..." : "Run All Tests"}
              </Button>
              <Button
                onClick={testFileOperations}
                disabled={!state.isInitialized || isRunningTests}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Test File Ops
              </Button>
              <Button
                onClick={testPtyOperations}
                disabled={!state.isInitialized || isRunningTests}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Terminal className="h-4 w-4" />
                Test PTY
              </Button>
              <Button
                onClick={testProcStat}
                disabled={!state.isInitialized || isRunningTests}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                Proc Stats
              </Button>
              <Button
                onClick={clearResults}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File List Card */}
        {fileList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Files in /home/test ({fileList.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {fileList.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded"
                  >
                    <FileText className="h-3 w-3" />
                    <span className="text-sm font-mono">{file}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results Card */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Test Results ({testResults.length} entries)
              </CardTitle>
              <CardDescription>
                Live output from WASM kernel operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-md font-mono text-sm max-h-96 overflow-y-auto border">
                {testResults.map((result, index) => (
                  <div key={index} className="mb-1 leading-relaxed">
                    {result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About WASM Kernel Demo
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This demo showcases a minimal C → WebAssembly kernel with:
            </p>
            <div className="text-sm space-y-1 ml-4">
              <div>
                • <strong>Emscripten WasmFS</strong> - Virtual file system
              </div>
              <div>
                • <strong>POSIX I/O</strong> - Standard file operations
              </div>
              <div>
                • <strong>Event Bus ABI</strong> - Inter-component communication
              </div>
              <div>
                • <strong>Crash-safe writes</strong> - Atomic file operations
              </div>
              <div>
                • <strong>PTY Support</strong> - Pseudo-terminal interface
              </div>
              <div>
                • <strong>Process Table</strong> - Process management
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Target size: ≤250kB gzipped. Built with modern Emscripten
              toolchain.
            </p>
          </CardContent>
        </Card>

        {/* Enhanced Terminal Component */}
        <TerminalComponent className="w-full" />
      </div>
    </div>
  );
};

// Store init data globally
let globalInitData: PluginInitData | undefined;

// Create the plugin object
const WasmKernelDemoPlugin: Plugin = {
  id: manifest.id,
  manifest,

  init: (initData?: PluginInitData) => {
    console.log(
      "WASM Kernel Demo plugin initialized",
      initData ? "with init data" : "without init data"
    );
    globalInitData = initData;
  },

  onOpen: (initData?: PluginInitData) => {
    console.log(
      "WASM Kernel Demo plugin opened",
      initData ? "with init data" : "without init data"
    );
    // Update init data when opened with new data
    if (initData) {
      globalInitData = initData;
    }
  },

  render: () => {
    return <WasmKernelDemoComponent initData={globalInitData} />;
  },
};

export default WasmKernelDemoPlugin;
