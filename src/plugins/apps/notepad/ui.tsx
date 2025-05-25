import React from "react";

import { Textarea } from "@/components/ui/api/textarea";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  WindowsMenubar,
  WindowsMenubarContent,
  WindowsMenubarTrigger,
} from "@/components/ui/windows";

import { Plugin, PluginManifest } from "../../../plugins/types";
import { manifest } from "./manifest";

// Create a separate React component for the Notepad
const NotepadComponent: React.FC = () => {
  // State to manage the textarea content
  const [noteContent, setNoteContent] = React.useState<string>("");

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  return (
    <div className="P-0 h-full flex flex-col">
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
            File
          </WindowsMenubarTrigger>
          <WindowsMenubarContent>
            <MenubarItem className="hover:bg-muted">
              New Document
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="hover:bg-muted">
              Open...
              <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted">
              Save
              <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="hover:bg-muted">Export as PDF</MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted">Print</MenubarItem>
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
            Edit
          </WindowsMenubarTrigger>
          <WindowsMenubarContent>
            <MenubarItem className="hover:bg-muted" onClick={() => {}}>
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="hover:bg-muted" onClick={() => {}}>
              Redo
              <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted" onClick={() => {}}>
              Copy
              <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem className="hover:bg-muted" onClick={() => {}}>
              Cut
              <MenubarShortcut>⌘X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              className="hover:bg-muted"
              onClick={() => document.execCommand("paste")}
            >
              Paste
              <MenubarShortcut>⌘V</MenubarShortcut>
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
            View
          </WindowsMenubarTrigger>
          <WindowsMenubarContent>
            <MenubarItem className="hover:bg-muted">Zoom In</MenubarItem>
            <MenubarItem className="hover:bg-muted">Zoom Out</MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted">Full Screen</MenubarItem>
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
            Format
          </WindowsMenubarTrigger>
          <WindowsMenubarContent>
            <MenubarItem className="hover:bg-muted">Font...</MenubarItem>
            <MenubarItem className="hover:bg-muted">Paragraph...</MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted">
              Bullets & Numbering
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted">
              Headers & Footers
            </MenubarItem>
            <MenubarItem className="hover:bg-muted">Page Setup...</MenubarItem>
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
            Help
          </WindowsMenubarTrigger>
          <WindowsMenubarContent>
            <MenubarItem className="hover:bg-muted">Documentation</MenubarItem>
            <MenubarItem className="hover:bg-muted">
              Keyboard Shortcuts
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted">
              About Word Editor
            </MenubarItem>
          </WindowsMenubarContent>
        </MenubarMenu>
      </WindowsMenubar>{" "}
      {/* API-enabled textarea for AI interaction */}
      <Textarea
        apiId={manifest.id}
        className="flex-1 w-full p-1 rounded-none resize-none bg-background text-foreground"
        placeholder="Type your notes here..."
        value={noteContent}
        onChange={handleTextChange}
      />
    </div>
  );
};

const NotepadPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Notepad plugin initialized");
  },
  render: () => {
    return <NotepadComponent />;
  },
};

export default NotepadPlugin;
