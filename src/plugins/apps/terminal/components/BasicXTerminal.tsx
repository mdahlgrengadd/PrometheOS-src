import '@xterm/xterm/css/xterm.css';

import React, { useEffect, useRef } from 'react';

import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerm } from '@xterm/xterm';

interface BasicXTerminalProps {
  className?: string;
}

export const BasicXTerminal: React.FC<BasicXTerminalProps> = ({
  className,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create xterm instance
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
    xterm.writeln("Minimal XTerm Test Terminal");
    xterm.writeln("Type anything and press Enter to see echo:");
    xterm.write("$ ");

    let currentLine = "";

    // Handle input
    xterm.onData((data) => {
      console.log("Input:", JSON.stringify(data));

      if (data === "\r" || data === "\n") {
        // Enter pressed
        xterm.write("\r\n");
        if (currentLine.trim()) {
          xterm.writeln(`Echo: ${currentLine}`);
        }
        currentLine = "";
        xterm.write("$ ");
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
  }, []);

  return (
    <div className={className} style={{ width: "100%", height: "400px" }}>
      <div
        ref={terminalRef}
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid #444",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};
