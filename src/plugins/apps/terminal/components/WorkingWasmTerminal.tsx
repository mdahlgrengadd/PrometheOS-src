import '@xterm/xterm/css/xterm.css';

import React, { useEffect, useRef, useState } from 'react';

import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerm } from '@xterm/xterm';

import { useWasmKernel } from '../../../../hooks/useWasmKernel';

interface WorkingWasmTerminalProps {
  className?: string;
}

export const WorkingWasmTerminal: React.FC<WorkingWasmTerminalProps> = ({
  className,
}) => {
  const { api, state } = useWasmKernel();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef<boolean>(false);
  const lastScreenContentRef = useRef<string>("");
  useEffect(() => {
    if (!terminalRef.current || !api || !state.isInitialized) return;

    console.log("🚀 Initializing Working WASM Terminal...");

    // Prevent double initialization
    if (xtermRef.current) {
      console.log("⚠️ Terminal already initialized, skipping...");
      return;
    }
    const initTerminal = async () => {
      // Local state to avoid React dependency issues
      let terminalReady = false; // Create xterm instance
      const xterm = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        fontWeight: "normal",
        fontWeightBold: "bold",
        lineHeight: 1.0,
        letterSpacing: 0,
        allowTransparency: false,
        disableStdin: false,
        convertEol: true,
        theme: {
          background: "#0c0c0c",
          foreground: "#00ff00",
          cursor: "#00ff00",
          cursorAccent: "#0c0c0c",
          selectionBackground: "#00ff0040",
          black: "#000000",
          red: "#ff0000",
          green: "#00ff00",
          yellow: "#ffff00",
          blue: "#0080ff",
          magenta: "#ff00ff",
          cyan: "#00ffff",
          white: "#ffffff",
          brightBlack: "#808080",
          brightRed: "#ff8080",
          brightGreen: "#80ff80",
          brightYellow: "#ffff80",
          brightBlue: "#80c0ff",
          brightMagenta: "#ff80ff",
          brightCyan: "#80ffff",
          brightWhite: "#ffffff",
        },
      });

      // Create fit addon
      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon); // Open terminal
      xterm.open(terminalRef.current!);
      fitAddon.fit(); // Force CSS font override after terminal is opened
      const terminalElement = terminalRef.current!;
      const style = document.createElement("style");
      style.textContent = `
        /* Ultra-aggressive xterm font override */
        .xterm,
        .xterm *,
        .xterm .xterm-viewport,
        .xterm .xterm-screen,
        .xterm .xterm-rows,
        .xterm .xterm-cursor-layer,
        .xterm .xterm-text-layer,
        .xterm .xterm-selection-layer,
        .xterm .xterm-helper-textarea,
        .xterm canvas {
          font-family: Consolas, "Courier New", monospace !important;
          font-size: 14px !important;
          line-height: 1.0 !important;
          letter-spacing: 0 !important;
          font-weight: normal !important;
        }
        .xterm .xterm-bold {
          font-weight: bold !important;
        }
        /* Override any parent containers */
        [class*="terminal"] *,
        div[style*="font-family"] .xterm,
        div[style*="font-family"] .xterm * {
          font-family: Consolas, "Courier New", monospace !important;
        }
      `;
      document.head.appendChild(style);

      // Set a unique ID for this terminal to target it specifically
      terminalElement.setAttribute("data-terminal-id", "wasm-terminal");

      // Additional aggressive styling
      const additionalStyle = document.createElement("style");
      additionalStyle.textContent = `
        [data-terminal-id="wasm-terminal"],
        [data-terminal-id="wasm-terminal"] *,
        [data-terminal-id="wasm-terminal"] .xterm,
        [data-terminal-id="wasm-terminal"] .xterm * {
          font-family: Consolas, "Courier New", monospace !important;
          font-size: 14px !important;
        }
      `;
      document.head.appendChild(additionalStyle);

      // Force styles with highest specificity after a delay
      setTimeout(() => {
        const allElements = terminalElement.querySelectorAll("*");
        allElements.forEach((element) => {
          if (element instanceof HTMLElement) {
            element.style.setProperty(
              "font-family",
              'Consolas, "Courier New", monospace',
              "important"
            );
            element.style.setProperty("font-size", "14px", "important");
          }
        });

        // Target canvases specifically
        const canvases = terminalElement.querySelectorAll("canvas");
        canvases.forEach((canvas) => {
          if (canvas.parentElement) {
            canvas.parentElement.style.setProperty(
              "font-family",
              'Consolas, "Courier New", monospace',
              "important"
            );
            canvas.parentElement.style.setProperty(
              "font-size",
              "14px",
              "important"
            );
            canvas.parentElement.style.setProperty(
              "line-height",
              "1.0",
              "important"
            );
          }
        });
      }, 100);

      // Store references
      xtermRef.current = xterm;
      fitAddonRef.current = fitAddon;
      try {
        // Initialize WASM shell properly
        xterm.writeln("🔧 Working WASM Terminal");
        xterm.writeln("Initializing shell...");
        console.log("🔧 API available:", !!api);
        console.log("🔧 State initialized:", state.isInitialized);

        // Set PTY to canonical mode with echo (normal shell mode)
        const constants = await api.getPtyModeConstants();
        console.log("✅ PTY constants obtained:", constants);
        await api.ptySetMode(constants.CANON | constants.ECHO);
        xterm.writeln("✅ PTY set to CANON+ECHO mode");

        // Call shell prompt to initialize
        await api.shellPrompt();
        xterm.writeln("✅ Shell prompt called");

        // Try to initialize shell system if available
        try {
          // Note: shell_init might not be exposed as API, that's ok
          console.log("🔧 Attempting shell initialization...");
        } catch (initError) {
          console.log("ℹ️ Shell init not available:", initError);
        }

        // Get initial screen content
        const initialScreen = await api.ptyGetScreen();
        console.log(
          "📺 Initial screen content:",
          initialScreen.length,
          "chars"
        );
        if (initialScreen.trim()) {
          xterm.writeln("✅ Initial screen loaded");
          lastScreenContentRef.current = initialScreen;
        }

        xterm.writeln("");
        xterm.writeln("🎉 WASM Shell Ready! Available commands:");
        xterm.writeln("help, ls, cd, pwd, echo, cat, mkdir, ps, env, whoami");
        xterm.writeln("");
        xterm.write("$ ");

        setIsReady(true);
        terminalReady = true; // Set local ready state
        console.log("✅ WASM terminal fully initialized and ready");
      } catch (error) {
        console.error("❌ Failed to initialize WASM shell:", error);
        xterm.writeln(`❌ Error: ${error}`);
        xterm.writeln("Falling back to local mode");
        xterm.write("local$ ");
      }
      let currentLine = "";

      // Handle input
      xterm.onData(async (data) => {
        if (data === "\r" || data === "\n") {
          // Enter pressed
          xterm.write("\r\n");
          if (currentLine.trim()) {
            console.log(
              "🔍 Command entered:",
              currentLine,
              "Terminal ready:",
              terminalReady
            );

            if (terminalReady && api) {
              try {
                // Send command to WASM shell using direct execution
                console.log("📤 Executing WASM command:", currentLine);

                // Clear the terminal screen first to get clean output
                await api.terminalClear();

                // Execute the command
                await api.shellExecute(currentLine);

                // Wait a moment for the command to execute
                setTimeout(async () => {
                  try {
                    // Get the screen content after command execution
                    const screenOutput = await api.ptyGetScreen();
                    console.log(
                      "📺 Command output screen:",
                      screenOutput.length,
                      "chars"
                    );
                    console.log(
                      "📄 Raw output:",
                      JSON.stringify(screenOutput.substring(0, 200))
                    );

                    if (screenOutput.trim()) {
                      // Parse and display the output
                      const lines = screenOutput.split("\n");
                      let hasOutput = false;

                      for (const line of lines) {
                        const cleanLine = line.trim();
                        if (
                          cleanLine &&
                          cleanLine !== "" &&
                          !cleanLine.match(/^\s*$/)
                        ) {
                          xterm.writeln(cleanLine);
                          hasOutput = true;
                        }
                      }

                      if (!hasOutput) {
                        xterm.writeln("(command executed, no output)");
                      }
                    } else {
                      xterm.writeln("(command executed, no output)");
                    }
                  } catch (error) {
                    console.error("❌ Error getting screen output:", error);
                    xterm.writeln(`Error getting output: ${error}`);
                  }

                  // Show new prompt
                  xterm.write("$ ");
                }, 150); // Increased wait time
              } catch (error) {
                console.error("❌ Command execution failed:", error);
                xterm.writeln(`Error: ${error}`);
                xterm.write("$ ");
              }
            } else {
              // Local fallback
              if (currentLine.trim() === "help") {
                xterm.writeln("Local commands: help, clear, echo <text>");
              } else if (currentLine.trim() === "clear") {
                xterm.clear();
              } else if (currentLine.trim().startsWith("echo ")) {
                const text = currentLine.trim().substring(5);
                xterm.writeln(text);
              } else {
                xterm.writeln(`Unknown command: ${currentLine.trim()}`);
              }
              xterm.write("local$ ");
            }
          } else {
            // Empty line
            xterm.write(isReady ? "$ " : "local$ ");
          }

          // Reset line
          currentLine = "";
        } else if (data === "\b" || data === "\x7f") {
          // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            xterm.write("\b \b");
          }
        } else if (data >= " " && data <= "~") {
          // Printable characters
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
    };

    initTerminal();
  }, [api, state.isInitialized]); // Removed isReady from dependencies to prevent re-initialization
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <div
        style={{
          marginBottom: "8px",
          color: "#00ff00",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        WASM Terminal v1.0 - Retro Green Theme
      </div>
      <div
        ref={terminalRef}
        style={{
          width: "100%",
          height: "calc(100% - 30px)",
          border: "1px solid #00ff00",
          borderRadius: "4px",
          boxShadow: "0 0 10px rgba(0, 255, 0, 0.3)",
        }}
      />
    </div>
  );
};
