import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { useWasmKernel } from '../../../../hooks/useWasmKernel';

interface TerminalProps {
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ className }) => {
  const { api, state } = useWasmKernel();
  const [output, setOutput] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [mode, setMode] = useState<string>("CANON+ECHO");
  const [isConnected, setIsConnected] = useState(false);
  const [modeConstants, setModeConstants] = useState({
    RAW: 1,
    ECHO: 2,
    CANON: 4,
  });
  const terminalRef = useRef<HTMLPreElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Initialize terminal and get mode constants
  useEffect(() => {
    if (!api || !state.isInitialized) return;

    const initTerminal = async () => {
      console.log("🚀 Initializing terminal...");
      try {
        // Get PTY mode constants
        console.log("📋 Getting PTY mode constants...");
        const constants = await api.getPtyModeConstants();
        console.log("✅ PTY constants:", constants);
        setModeConstants(constants);

        // Initialize with canonical mode + echo
        console.log("⚙️ Setting PTY mode to CANON+ECHO...");
        await api.ptySetMode(constants.CANON | constants.ECHO);

        // Get initial screen content
        console.log("📺 Getting initial screen content...");
        const screen = await api.ptyGetScreen();
        console.log("✅ Initial screen:", screen.length, "chars:", screen);
        setOutput(screen);

        setIsConnected(true);
        console.log("✅ Terminal initialization complete");
      } catch (error) {
        console.error("❌ Failed to initialize terminal:", error);
      }
    };

    initTerminal();
  }, [api, state.isInitialized]); // Poll for output updates
  useEffect(() => {
    if (!api || !isConnected) return;

    console.log("🔄 Starting PTY output polling...");
    const pollOutput = async () => {
      try {
        const hasData = await api.ptyHasData();
        if (hasData) {
          const newOutput = await api.ptyRead();
          if (newOutput) {
            console.log("📄 PTY read output:", newOutput.length, "chars");
            setOutput((prev) => {
              const updated = prev + newOutput;
              return updated;
            });
          }
        }
      } catch (error) {
        // Reduce error spam - only log every 10th error
        if (Math.random() < 0.1) {
          console.error("❌ Error polling PTY output:", error);
        }
      }
    };

    const interval = setInterval(pollOutput, 200); // Increased interval to reduce load
    return () => {
      console.log("🛑 Stopping PTY output polling...");
      clearInterval(interval);
    };
  }, [api, isConnected]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);
  // Handle input changes - only for canonical mode line editing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow input changes in canonical mode
      if (mode.includes("CANON")) {
        setInput(e.target.value);
      }
    },
    [mode]
  );
  // Handle key presses - send characters directly to PTY
  const handleInputKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!api) return;

      try {
        // In RAW mode, send every key immediately and prevent default browser behavior
        if (mode === "RAW") {
          e.preventDefault();

          // Handle special keys
          if (e.key === "Enter") {
            await api.ptyWrite("\r");
          } else if (e.key === "Backspace") {
            await api.ptyWrite("\b");
          } else if (e.key === "Tab") {
            await api.ptyWrite("\t");
          } else if (e.key === "Escape") {
            await api.ptyWrite("\x1b");
          } else if (e.key.length === 1) {
            // Send printable character
            await api.ptyWrite(e.key);
          }
          return;
        }

        // In CANONICAL mode, handle line editing
        if (mode.includes("CANON")) {
          if (e.key === "Enter") {
            e.preventDefault();
            // Send the complete line with newline - PTY will handle command execution
            console.log("📤 Sending command to PTY:", input);
            await api.ptyWrite(input + "\n");
            setInput("");
          }
          // Let other keys be handled by the input field for line editing
          return;
        }

        // In ECHO-only mode, send characters immediately
        if (mode === "ECHO") {
          e.preventDefault();
          if (e.key === "Enter") {
            await api.ptyWrite("\n");
          } else if (e.key === "Backspace") {
            await api.ptyWrite("\b");
          } else if (e.key.length === 1) {
            await api.ptyWrite(e.key);
          }
        }
      } catch (error) {
        console.error("Error sending input to PTY:", error);
      }
    },
    [api, input, mode]
  );
  const handleCommand = useCallback(
    async (command: string) => {
      if (!api) {
        console.log("❌ No API available for command:", command);
        return;
      }

      console.log("� Executing command via PTY:", command);
      try {
        // Send command through PTY like normal user input
        await api.ptyWrite(command + "\n");
        console.log("✅ Command sent to PTY:", command);
      } catch (error) {
        console.error("❌ Error sending command to PTY:", command, error);
      }
    },
    [api]
  );

  const handleModeChange = useCallback(
    async (newMode: string) => {
      if (!api) return;

      try {
        let modeFlags = 0;

        switch (newMode) {
          case "RAW":
            modeFlags = modeConstants.RAW;
            break;
          case "ECHO":
            modeFlags = modeConstants.ECHO;
            break;
          case "CANON":
            modeFlags = modeConstants.CANON;
            break;
          case "CANON+ECHO":
            modeFlags = modeConstants.CANON | modeConstants.ECHO;
            break;
          default:
            modeFlags = modeConstants.CANON | modeConstants.ECHO;
        }

        await api.ptySetMode(modeFlags);
        setMode(newMode);
      } catch (error) {
        console.error("Error setting PTY mode:", error);
      }
    },
    [api, modeConstants]
  );
  const clearTerminal = useCallback(async () => {
    if (!api) return;

    try {
      await api.terminalClear();
      const screen = await api.ptyGetScreen();
      setOutput(screen);
    } catch (error) {
      console.error("Error clearing terminal:", error);
    }
  }, [api]);
  const refreshScreen = useCallback(async () => {
    if (!api) return;

    try {
      console.log("🔄 Manually refreshing screen...");
      const screen = await api.ptyGetScreen();
      console.log("📺 Manual refresh - screen length:", screen.length);
      setOutput(screen);
    } catch (error) {
      console.error("❌ Error refreshing screen:", error);
    }
  }, [api]);
  const predefinedCommands = [
    "help",
    'echo "Hello Shell"',
    "pwd",
    "ls",
    "ps",
    "env",
    "whoami",
  ];

  if (!state.isInitialized) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>WASM Terminal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {state.isLoading
              ? "Initializing WASM kernel..."
              : "WASM kernel not available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>WASM Terminal</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant="outline">Mode: {mode}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Terminal Output */}
        <div className="border rounded-lg bg-black text-green-400 p-4 font-mono text-sm overflow-hidden">
          <pre
            ref={terminalRef}
            className="whitespace-pre-wrap h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {output}
          </pre>
        </div>{" "}
        {/* Terminal Input */}
        <div className="flex gap-2">
          {mode.includes("CANON") ? (
            // Canonical mode: use input field for line editing
            <>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Type commands here... (Canonical mode - press Enter to send)"
                className="flex-1 px-3 py-2 border rounded-md font-mono text-sm bg-black text-green-400 border-gray-600 focus:border-green-500 focus:outline-none"
                disabled={!isConnected}
              />
              <Button
                onClick={() => setInput("")}
                variant="outline"
                size="sm"
                disabled={!isConnected}
              >
                Clear
              </Button>
            </>
          ) : (
            // Raw mode: use focused div that captures all keystrokes
            <div className="flex-1 relative">
              <div
                tabIndex={0}
                onKeyDown={handleInputKeyDown}
                className="w-full px-3 py-2 border rounded-md font-mono text-sm bg-black text-green-400 border-gray-600 focus:border-green-500 focus:outline-none cursor-text"
                style={{ minHeight: "38px" }}
              >
                <span className="text-gray-500">
                  {mode === "RAW"
                    ? "Raw mode - all keystrokes sent immediately"
                    : "Echo mode - typing sent immediately"}
                </span>
              </div>
            </div>
          )}
        </div>
        {/* Quick Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Commands:</h4>
          <div className="flex flex-wrap gap-2">
            {predefinedCommands.map((cmd) => (
              <Button
                key={cmd}
                onClick={() => handleCommand(cmd)}
                variant="outline"
                size="sm"
                disabled={!isConnected}
                className="font-mono text-xs"
              >
                {cmd}
              </Button>
            ))}
          </div>
        </div>{" "}
        {/* Mode Controls */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">PTY Mode:</h4>
          <div className="text-xs text-gray-600 mb-2">
            <div>
              <strong>RAW:</strong> Each keystroke sent immediately, no line
              editing
            </div>
            <div>
              <strong>CANON:</strong> Line buffering, press Enter to send
            </div>
            <div>
              <strong>ECHO:</strong> Characters echoed back by PTY
            </div>
            <div>
              <strong>CANON+ECHO:</strong> Normal shell mode (recommended)
            </div>
          </div>
          <div className="flex gap-2">
            {["RAW", "ECHO", "CANON", "CANON+ECHO"].map((modeName) => (
              <Button
                key={modeName}
                onClick={() => handleModeChange(modeName)}
                variant={mode === modeName ? "default" : "outline"}
                size="sm"
                disabled={!isConnected}
              >
                {modeName}
              </Button>
            ))}
          </div>
        </div>{" "}
        {/* Terminal Controls */}
        <div className="flex gap-2">
          <Button
            onClick={clearTerminal}
            variant="outline"
            size="sm"
            disabled={!isConnected}
          >
            Clear Screen
          </Button>
          <Button
            onClick={refreshScreen}
            variant="outline"
            size="sm"
            disabled={!isConnected}
          >
            Refresh Display
          </Button>
          <Button
            onClick={() => api?.ptyFlush()}
            variant="outline"
            size="sm"
            disabled={!isConnected}
          >
            Flush Buffer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
