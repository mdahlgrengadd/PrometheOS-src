import '@xterm/xterm/css/xterm.css';

import React, { useEffect, useRef } from 'react';

import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerm } from '@xterm/xterm';

import { useWasmKernel } from '../../../../hooks/useWasmKernel';

interface WasmTerminalProps {
  className?: string;
}

export const WasmTerminal: React.FC<WasmTerminalProps> = ({ className }) => {
  const { api, state } = useWasmKernel();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!api || !state.isInitialized || !terminalRef.current) return;

    console.log("🚀 Initializing WASM-integrated terminal...");

    const initTerminal = async () => {
      // Create xterm instance (same as working BasicXTerminal)
      const xterm = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: {
          background: "#1a1a1a",
          foreground: "#ffffff",
          cursor: "#ffffff",
          selectionBackground: "#3f3f3f",
        },
      });

      // Create fit addon
      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);

      // Open terminal
      xterm.open(terminalRef.current!);
      fitAddon.fit();

      // Store references
      xtermRef.current = xterm;
      fitAddonRef.current = fitAddon;

      // Welcome message
      xterm.writeln("\\x1b[1;32mWASM-Integrated Terminal\\x1b[0m");
      xterm.writeln(
        "\\x1b[36mUsing proven xterm.js + WASM shell integration\\x1b[0m"
      );
      xterm.writeln("");

      try {
        // Set PTY to RAW mode for full control
        const constants = await api.getPtyModeConstants();
        await api.ptySetMode(constants.RAW);
        console.log("✅ PTY set to RAW mode");

        // Get initial prompt from WASM shell
        await api.shellPrompt();

        // Wait a bit and read the prompt
        setTimeout(async () => {
          try {
            const promptOutput = await api.ptyRead();
            if (promptOutput) {
              xterm.write(promptOutput.replace(/\\n/g, "\\r\\n"));
            }
          } catch (error) {
            console.error("Error reading initial prompt:", error);
          }
        }, 100);
      } catch (error) {
        console.error("Error setting up WASM integration:", error);
        xterm.writeln(
          "\\x1b[31mFailed to initialize WASM shell - falling back to local mode\\x1b[0m"
        );
        xterm.write("local$ ");
      }

      let currentLine = "";
      let wasmMode = true;

      // Handle input (same pattern as working BasicXTerminal)
      xterm.onData(async (data) => {
        console.log("⌨️ Input:", JSON.stringify(data));

        if (data === "\\r" || data === "\\n") {
          // Enter pressed - process the line
          xterm.write("\\r\\n");

          if (currentLine.trim()) {
            if (wasmMode && api) {
              try {
                // Send command to WASM shell
                console.log("📤 Sending to WASM shell:", currentLine);
                await api.ptyWrite(currentLine + "\\n");

                // Wait for output
                setTimeout(async () => {
                  try {
                    const output = await api.ptyRead();
                    if (output) {
                      console.log("📥 WASM output:", JSON.stringify(output));
                      xterm.write(output.replace(/\\n/g, "\\r\\n"));
                    }

                    // Get new prompt
                    await api.shellPrompt();
                    setTimeout(async () => {
                      const promptOutput = await api.ptyRead();
                      if (promptOutput) {
                        xterm.write(promptOutput.replace(/\\n/g, "\\r\\n"));
                      }
                    }, 50);
                  } catch (error) {
                    console.error("Error reading WASM output:", error);
                    xterm.writeln(
                      "\\x1b[31mWASM error - switching to local mode\\x1b[0m"
                    );
                    wasmMode = false;
                    xterm.write("local$ ");
                  }
                }, 100);
              } catch (error) {
                console.error("Error sending to WASM:", error);
                wasmMode = false;
                xterm.writeln(
                  "\\x1b[31mWASM error - switching to local mode\\x1b[0m"
                );
                xterm.write("local$ ");
              }
            } else {
              // Local mode fallback (same as BasicXTerminal)
              if (currentLine.trim() === "help") {
                xterm.writeln("Available commands: help, clear, echo <text>");
              } else if (currentLine.trim() === "clear") {
                xterm.clear();
              } else if (currentLine.trim().startsWith("echo ")) {
                const text = currentLine.trim().substring(5);
                xterm.writeln(`Echo: ${text}`);
              } else {
                xterm.writeln(`Unknown local command: ${currentLine.trim()}`);
                xterm.writeln('Type "help" for available commands');
              }
              xterm.write("local$ ");
            }
          } else {
            // Empty command
            if (wasmMode && api) {
              try {
                await api.shellPrompt();
                setTimeout(async () => {
                  const promptOutput = await api.ptyRead();
                  if (promptOutput) {
                    xterm.write(promptOutput.replace(/\\n/g, "\\r\\n"));
                  }
                }, 50);
              } catch (error) {
                xterm.write("local$ ");
              }
            } else {
              xterm.write("local$ ");
            }
          }

          // Reset for new line
          currentLine = "";
        } else if (data === "\\b" || data === "\\x7f") {
          // Backspace - remove character (same as BasicXTerminal)
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            xterm.write("\\b \\b");
          }
        } else if (data >= " " && data <= "~") {
          // Printable characters - add to line and echo (same as BasicXTerminal)
          currentLine += data;
          xterm.write(data);
        }
      });

      // Handle resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };
      window.addEventListener("resize", handleResize);

      console.log("✅ WASM-integrated terminal ready");

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        if (xtermRef.current) {
          xtermRef.current.dispose();
        }
      };
    };

    initTerminal();
  }, [api, state.isInitialized]);

  if (!state.isInitialized) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#ffffff",
          backgroundColor: "#1a1a1a",
        }}
      >
        <div>
          <div style={{ marginBottom: "16px" }}>
            Initializing WASM kernel...
          </div>
          <div>Loading terminal...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ color: "#fff", margin: 0 }}>WASM-Integrated Terminal</h3>
        <p style={{ color: "#aaa", margin: "4px 0 0 0", fontSize: "14px" }}>
          xterm.js with WASM shell backend
        </p>
      </div>
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          border: "1px solid #444",
          borderRadius: "4px",
          minHeight: "300px",
        }}
      />
    </div>
  );
};
