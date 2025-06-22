import { CheckCircle, FileText, Folder, Loader2, Terminal, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWasmKernel } from '@/hooks/useWasmKernel';

export const WasmKernelDemo: React.FC = () => {
  const { state, api } = useWasmKernel();
  const [fileList, setFileList] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testFileOperations = async () => {
    if (!api) return;

    try {
      addTestResult("🧪 Starting file operation tests...");

      // Test 1: Create a directory
      await api.createDir("/home/test");
      addTestResult("✅ Created directory /home/test");

      // Test 2: Write a file
      const testData = new TextEncoder().encode("Hello from WASM Kernel!");
      await api.writeFile("/home/test/hello.txt", testData);
      addTestResult("✅ Written file /home/test/hello.txt");

      // Test 3: Read the file back
      const readData = await api.readFile("/home/test/hello.txt");
      const content = new TextDecoder().decode(readData);
      addTestResult(`✅ Read file content: "${content}"`);

      // Test 4: List directory
      const files = await api.listDir("/home/test");
      setFileList(files);
      addTestResult(`✅ Listed directory: ${files.join(", ")}`);

      // Test 5: Rename file
      await api.renameFile("/home/test/hello.txt", "/home/test/greeting.txt");
      addTestResult("✅ Renamed file to greeting.txt");

      // Test 6: List directory again
      const newFiles = await api.listDir("/home/test");
      setFileList(newFiles);
      addTestResult(`✅ Updated file list: ${newFiles.join(", ")}`);
    } catch (error) {
      addTestResult(`❌ Error: ${error}`);
    }
  };

  const testProcStat = async () => {
    if (!api) return;

    try {
      const procStat = await api.getProcStat();
      addTestResult(
        `📊 Process statistics: ${JSON.stringify(procStat, null, 2)}`
      );
    } catch (error) {
      addTestResult(`❌ Proc stat error: ${error}`);
    }
  };

  // Listen for filesystem events
  useEffect(() => {
    if (!api) return;

    const unsubscribe = api.onFileSystemEvent((event) => {
      addTestResult(`📡 FS Event: ${event.type} on ${event.path}`);
    });

    return unsubscribe;
  }, [api]);

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
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            WASM Kernel Status
          </CardTitle>
          <CardDescription>
            Current status:{" "}
            <Badge variant={state.isInitialized ? "default" : "secondary"}>
              {getStatusText()}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={testFileOperations}
              disabled={!state.isInitialized}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Test File Operations
            </Button>
            <Button
              onClick={testProcStat}
              disabled={!state.isInitialized}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Terminal className="h-4 w-4" />
              Test Proc Stat
            </Button>
          </div>
        </CardContent>
      </Card>

      {fileList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Files in /home/test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {fileList.map((file, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  {file}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md font-mono text-sm max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
