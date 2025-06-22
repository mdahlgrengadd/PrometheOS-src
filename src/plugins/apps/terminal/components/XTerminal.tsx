import '@xterm/xterm/css/xterm.css';

import React, { useEffect, useRef } from 'react';

import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerm } from '@xterm/xterm';

interface XTerminalProps {
  className?: string;
}

export const XTerminal: React.FC<XTerminalProps> = ({ className }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    console.log("🚀 Initializing minimal xterm.js terminal...");

    // Create xterm instance
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
    xterm.open(terminalRef.current);
    fitAddon.fit();

    // Store references
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Welcome message
    xterm.writeln("\\x1b[1;32mMinimal XTerm Test Terminal\\x1b[0m");
    xterm.writeln("\\x1b[36mNo WASM integration - pure xterm.js test\\x1b[0m");
    xterm.writeln("Type anything and press Enter to see local echo:");
    xterm.writeln("");
    xterm.write("test$ ");

    let currentLine = "";

    // Handle input with local echo and line buffering
    xterm.onData((data) => {
      console.log("⌨️ Input:", JSON.stringify(data));

      if (data === "\\r" || data === "\\n") {
        // Enter pressed - process the line
        xterm.write("\\r\\n");

        if (currentLine.trim()) {
          // Simulate command processing
          if (currentLine.trim() === "help") {
            xterm.writeln("Available commands: help, clear, echo <text>");
          } else if (currentLine.trim() === "clear") {
            xterm.clear();
          } else if (currentLine.trim().startsWith("echo ")) {
            const text = currentLine.trim().substring(5);
            xterm.writeln(`Echo: ${text}`);
          } else {
            xterm.writeln(`Unknown command: ${currentLine.trim()}`);
            xterm.writeln('Type "help" for available commands');
          }
        }

        // Reset for new line
        currentLine = "";
        xterm.write("test$ ");
      } else if (data === "\\b" || data === "\\x7f") {
        // Backspace - remove character
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          xterm.write("\\b \\b");
        }
      } else if (data >= " " && data <= "~") {
        // Printable characters - add to line and echo
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

    console.log("✅ Minimal xterm.js terminal ready");

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);

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
        <h3 style={{ color: "#fff", margin: 0 }}>
          Minimal XTerm Terminal Test
        </h3>
        <p style={{ color: "#aaa", margin: "4px 0 0 0", fontSize: "14px" }}>
          Pure xterm.js without WASM integration
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
