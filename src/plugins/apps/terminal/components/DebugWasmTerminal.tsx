import '@xterm/xterm/css/xterm.css';

import React, { useEffect, useRef, useState } from 'react';

import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerm } from '@xterm/xterm';

import { useWasmKernel } from '../../../../hooks/useWasmKernel';

interface DebugWasmTerminalProps {
  className?: string;
}

export const DebugWasmTerminal: React.FC<DebugWasmTerminalProps> = ({
  className,
}) => {
  const { api, state } = useWasmKernel();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    console.log("🚀 Initializing Debug WASM Terminal...");
    console.log("WASM State:", {
      isInitialized: state.isInitialized,
      hasApi: !!api,
    });

    // Create xterm instance (exact same as BasicXTerminal)
    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: "#1a1a1a",
        foreground: "#ffffff",
        cursor: "#ffffff",
      },
    });

    // Create fit addon
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    // Open terminal
    xterm.open(terminalRef.current);
    fitAddon.fit();

    // Store references
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Welcome message
    xterm.writeln("🔧 Debug WASM Terminal");
    xterm.writeln(
      `WASM Kernel: ${state.isInitialized ? "✅ Ready" : "❌ Not Ready"}`
    );
    xterm.writeln(`API Available: ${api ? "✅ Yes" : "❌ No"}`);
    xterm.writeln("");

    // Check WASM readiness
    const checkWasm = async () => {
      if (api && state.isInitialized) {
        try {
          // Test basic API call
          const constants = await api.getPtyModeConstants();
          console.log("✅ WASM API test successful:", constants);
          xterm.writeln("✅ WASM API test successful");
          setWasmReady(true);
          xterm.write("wasm$ ");
        } catch (error) {
          console.error("❌ WASM API test failed:", error);
          xterm.writeln("❌ WASM API test failed - using local mode");
          setWasmReady(false);
          xterm.write("local$ ");
        }
      } else {
        xterm.writeln("⏳ WASM not ready - using local mode");
        setWasmReady(false);
        xterm.write("local$ ");
      }
    };

    checkWasm();

    let currentLine = "";

    // Handle input (exact same as BasicXTerminal initially)
    xterm.onData(async (data) => {
      console.log(
        "🔍 Debug input:",
        JSON.stringify(data),
        "WASM ready:",
        wasmReady
      );

      if (data === "\r" || data === "\n") {
        // Enter pressed
        xterm.write("\r\n");

        if (currentLine.trim()) {
          console.log("🔍 Processing command:", currentLine);
          if (wasmReady && api) {
            // WASM mode - handle commands
            try {
              console.log("📤 Processing WASM command:", currentLine);
              if (currentLine.trim() === "help") {
                xterm.writeln(
                  "Available commands: help, clear, echo <text>, test-wasm, wasm-shell <cmd>, set-pty-mode <mode>, get-pty-mode, init-shell, exec-direct <cmd>, get-screen"
                );
              } else if (currentLine.trim() === "clear") {
                xterm.clear();
              } else if (currentLine.trim() === "test-wasm") {
                const constants = await api.getPtyModeConstants();
                xterm.writeln(`WASM API Test: ${JSON.stringify(constants)}`);
                xterm.writeln("✅ WASM API is working correctly!");
              } else if (currentLine.trim().startsWith("echo ")) {
                const text = currentLine.trim().substring(5);
                xterm.writeln(`WASM Echo: ${text}`);
              } else if (currentLine.trim().startsWith("wasm-shell ")) {
                const cmd = currentLine.trim().substring(11);
                xterm.writeln(`Sending to WASM shell: ${cmd}`);

                try {
                  // Try actual WASM PTY integration
                  await api.ptyWrite(cmd + "\n");

                  // Wait for output
                  setTimeout(async () => {
                    try {
                      const output = await api.ptyRead();
                      if (output) {
                        xterm.writeln(`Shell output: ${output}`);
                      } else {
                        xterm.writeln("No output received from shell");
                      }
                    } catch (readError) {
                      xterm.writeln(`Error reading shell output: ${readError}`);
                    }
                  }, 100);
                } catch (ptyError) {
                  xterm.writeln(`PTY Error: ${ptyError}`);
                }
              } else if (currentLine.trim() === "wasm-shell") {
                xterm.writeln("Usage: wasm-shell <command>");
                xterm.writeln("Examples:");
                xterm.writeln("  wasm-shell ls");
                xterm.writeln("  wasm-shell help");
                xterm.writeln("  wasm-shell pwd");
              } else if (currentLine.trim().startsWith("set-pty-mode ")) {
                const mode = currentLine.trim().substring(13).toUpperCase();
                try {
                  const constants = await api.getPtyModeConstants();
                  let modeValue = 0;

                  if (mode === "RAW") {
                    modeValue = constants.RAW;
                  } else if (mode === "ECHO") {
                    modeValue = constants.ECHO;
                  } else if (mode === "CANON") {
                    modeValue = constants.CANON;
                  } else if (mode === "CANON+ECHO") {
                    modeValue = constants.CANON | constants.ECHO;
                  } else {
                    xterm.writeln(`Unknown mode: ${mode}`);
                    xterm.writeln(
                      "Available modes: RAW, ECHO, CANON, CANON+ECHO"
                    );
                    return;
                  }
                  await api.ptySetMode(modeValue);
                  xterm.writeln(`✅ PTY mode set to: ${mode}`);
                } catch (error) {
                  xterm.writeln(`❌ Failed to set PTY mode: ${error}`);
                }
              } else if (currentLine.trim() === "get-pty-mode") {
                try {
                  const currentMode = await api.ptyGetMode();
                  const constants = await api.getPtyModeConstants();

                  const modeNames = [];
                  if (currentMode & constants.RAW) modeNames.push("RAW");
                  if (currentMode & constants.ECHO) modeNames.push("ECHO");
                  if (currentMode & constants.CANON) modeNames.push("CANON");
                  xterm.writeln(
                    `Current PTY mode: ${currentMode} (${
                      modeNames.join("+") || "NONE"
                    })`
                  );
                } catch (error) {
                  xterm.writeln(`❌ Failed to get PTY mode: ${error}`);
                }
              } else if (currentLine.trim() === "init-shell") {
                try {
                  xterm.writeln("🚀 Initializing shell...");

                  // Set PTY to canonical mode with echo (normal shell mode)
                  const constants = await api.getPtyModeConstants();
                  await api.ptySetMode(constants.CANON | constants.ECHO);
                  xterm.writeln("✅ PTY set to CANON+ECHO mode");

                  // Call shell prompt to initialize
                  await api.shellPrompt();
                  xterm.writeln("✅ Shell prompt called");

                  // Try to read initial prompt
                  setTimeout(async () => {
                    try {
                      const promptOutput = await api.ptyRead();
                      if (promptOutput) {
                        xterm.writeln(`Shell prompt: "${promptOutput}"`);
                      } else {
                        xterm.writeln("No prompt output received");
                      }
                    } catch (error) {
                      xterm.writeln(`Error reading prompt: ${error}`);
                    }
                  }, 100);
                } catch (error) {
                  xterm.writeln(`❌ Failed to initialize shell: ${error}`);
                }
              } else if (currentLine.trim().startsWith("exec-direct ")) {
                const cmd = currentLine.trim().substring(12);
                try {
                  xterm.writeln(`🔧 Executing direct shell command: ${cmd}`);

                  // Try using shellExecute directly instead of PTY
                  await api.shellExecute(cmd);
                  xterm.writeln("✅ Command sent to shell");

                  // Try to read any output from PTY
                  setTimeout(async () => {
                    try {
                      const output = await api.ptyRead();
                      if (output) {
                        xterm.writeln(`Direct output: ${output}`);
                      } else {
                        xterm.writeln("No direct output received");
                      }
                    } catch (error) {
                      xterm.writeln(`Error reading direct output: ${error}`);
                    }
                  }, 100);
                } catch (error) {
                  xterm.writeln(
                    `❌ Failed to execute direct command: ${error}`
                  );
                }
              } else if (currentLine.trim() === "get-screen") {
                try {
                  xterm.writeln("🔍 Getting terminal screen content...");
                  const screen = await api.ptyGetScreen();
                  xterm.writeln(`Screen content (${screen.length} chars):`);
                  xterm.writeln(`"${screen}"`);

                  // Also try to check if there's data available
                  const hasData = await api.ptyHasData();
                  xterm.writeln(`PTY has data: ${hasData}`);
                } catch (error) {
                  xterm.writeln(`❌ Failed to get screen: ${error}`);
                }
              } else {
                xterm.writeln(`WASM Echo: ${currentLine}`);
                xterm.writeln(
                  "Try: help, clear, echo <text>, test-wasm, wasm-shell <command>"
                );
              }
            } catch (error) {
              console.error("❌ WASM command failed:", error);
              xterm.writeln(`WASM Error: ${error}`);
            }
          } else {
            // Local mode fallback (same as BasicXTerminal)
            if (currentLine.trim() === "help") {
              xterm.writeln(
                "Available commands: help, clear, echo <text>, test-wasm"
              );
            } else if (currentLine.trim() === "clear") {
              xterm.clear();
            } else if (currentLine.trim() === "test-wasm") {
              await checkWasm();
            } else if (currentLine.trim().startsWith("echo ")) {
              const text = currentLine.trim().substring(5);
              xterm.writeln(`Local Echo: ${text}`);
            } else {
              xterm.writeln(`Local Echo: ${currentLine}`);
            }
          }
        }

        // Reset for new command
        currentLine = "";
        xterm.write(wasmReady ? "wasm$ " : "local$ ");
      } else if (data === "\b" || data === "\x7f") {
        // Backspace (exact same as BasicXTerminal)
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          xterm.write("\b \b");
        }
      } else if (data >= " " && data <= "~") {
        // Printable characters (exact same as BasicXTerminal)
        currentLine += data;
        xterm.write(data);
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [api, state.isInitialized, wasmReady]); // Include all dependencies

  // Update WASM readiness when state changes
  useEffect(() => {
    if (xtermRef.current && api && state.isInitialized && !wasmReady) {
      const checkWasm = async () => {
        try {
          const constants = await api.getPtyModeConstants();
          console.log("✅ WASM became ready:", constants);
          xtermRef.current?.writeln("\r\n✅ WASM kernel now ready!");
          setWasmReady(true);
          xtermRef.current?.write("wasm$ ");
        } catch (error) {
          console.error("❌ WASM still not ready:", error);
        }
      };
      checkWasm();
    }
  }, [api, state.isInitialized, wasmReady]);

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <div style={{ marginBottom: "8px", color: "#aaa", fontSize: "12px" }}>
        Debug WASM Terminal - WASM: {state.isInitialized ? "✅" : "❌"} | API:{" "}
        {api ? "✅" : "❌"} | Ready: {wasmReady ? "✅" : "❌"}
      </div>
      <div
        ref={terminalRef}
        style={{
          width: "100%",
          height: "calc(100% - 30px)",
          border: "1px solid #444",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};
