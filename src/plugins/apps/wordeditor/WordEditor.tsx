import './TaskList.css';
import './word-editor.css'; // Import the CSS file with layout-specific styles
import './word-editor.scss'; // Import the SCSS file with theme-specific styles

import React, { useEffect, useRef, useState } from 'react';
import { Markdown } from 'tiptap-markdown';

import { registerApiActionHandler } from '@/api/context/ApiContext';
import { IActionResult } from '@/api/core/types';
import { useApiComponent } from '@/api/hoc/withApi';
import {
    MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut
} from '@/components/ui/menubar';
import {
    WindowsMenubar, WindowsMenubarContent, WindowsMenubarTrigger
} from '@/components/ui/windows';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import content from './content.json';
import FontSize from './extensions/FontSize';
// Internal components (toolbar + page view)
import WordEditorContent from './ui';
import WordEditorToolbar from './WordEditorToolbar';

// API doc for WordEditor
export const wordEditorApiDoc = {
  type: "Tiptap",
  description: "A rich text editor (Tiptap) for word processing.",
  state: {
    enabled: true,
    visible: true,
    value: "",
  },
  actions: [
    {
      id: "setValue",
      name: "Set Value",
      description:
        "Set the content of the word editor. Supports Markdown or Tiptap JSON.",
      available: true,
      parameters: [
        {
          name: "value",
          type: "text", // Use multiline textbox in API Explorer
          description:
            "The content to set in the editor (Markdown or Tiptap JSON).",
          required: true,
        },
        {
          name: "format",
          type: "string",
          description:
            "Content format: 'markdown' (default) or 'json' (Tiptap JSON).",
          required: false,
          enum: ["markdown", "json"],
        },
      ],
    },
    {
      id: "getValue",
      name: "Get Value",
      description: "Get the current plain text content of the editor.",
      available: true,
      parameters: [],
    },
  ],
  path: "/plugins/apps/wordeditor",
};

const WordEditor = () => {
  const [documentName, setDocumentName] = useState("Untitled Document");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "mx-auto max-w-full h-auto",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      FontSize.configure({
        types: ["textStyle"],
      }),
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Subscript,
      Superscript,
      CharacterCount,
      Markdown.configure({
        html: false,
        tightLists: true,
      }),
    ],
    content: content,
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none",
      },
    },
    editable: true,
  });

  // Register API action handlers for setValue/getValue
  const apiId = "wordeditor";
  const lastTextRef = useRef("");

  // Use the API component hook to register and update state
  const staticApiDoc = React.useMemo(() => {
    const { state, ...doc } = wordEditorApiDoc;
    return doc;
  }, []);

  const { updateState } = useApiComponent(apiId, staticApiDoc);

  // Track whether handlers have been registered
  const handlersRef = React.useRef(false);

  useEffect(() => {
    if (!editor) return;

    // Update state whenever editor content changes
    const currentValue = editor.getText();
    updateState({ value: currentValue });

    if (!handlersRef.current) {
      handlersRef.current = true;

      // Handler to set the editor content
      const setValueHandler = async (
        params?: Record<string, unknown>
      ): Promise<IActionResult> => {
        if (!params || typeof params.value !== "string") {
          return {
            success: false,
            error: "setValue requires a 'value' parameter of type string",
          };
        }
        // Support both Markdown and Tiptap JSON
        if (
          params.format === "markdown" ||
          (!params.format && typeof params.value === "string")
        ) {
          // Set content as Markdown using the Markdown extension's storage
          if (
            editor.storage &&
            editor.storage.markdown &&
            typeof editor.storage.markdown.setMarkdown === "function"
          ) {
            editor.storage.markdown.setMarkdown(params.value);
          } else {
            // fallback: set as plain text
            editor.commands.setContent(params.value);
          }
        } else if (params.format === "json") {
          // Set content as Tiptap JSON
          try {
            const json =
              typeof params.value === "string"
                ? JSON.parse(params.value)
                : params.value;
            editor.commands.setContent(json);
          } catch (e) {
            return { success: false, error: "Invalid JSON for Tiptap content" };
          }
        } else {
          // Default: treat as Markdown
          if (
            editor.storage &&
            editor.storage.markdown &&
            typeof editor.storage.markdown.setMarkdown === "function"
          ) {
            editor.storage.markdown.setMarkdown(params.value);
          } else {
            editor.commands.setContent(params.value);
          }
        }
        lastTextRef.current = params.value;
        updateState({ value: params.value });
        return { success: true, data: { value: params.value } };
      };

      // Handler to get the current plain text content
      const getValueHandler = async (): Promise<IActionResult> => {
        const value = editor.getText();
        lastTextRef.current = value;
        return { success: true, data: { value } };
      };

      registerApiActionHandler(apiId, "setValue", setValueHandler);
      registerApiActionHandler(apiId, "getValue", getValueHandler);

      // Optionally, register for @src suffix for compatibility
      registerApiActionHandler(apiId + "@src", "setValue", setValueHandler);
      registerApiActionHandler(apiId + "@src", "getValue", getValueHandler);
    }

    // Setup editor change handler to update state
    editor.on("update", () => {
      const value = editor.getText();
      updateState({ value });
    });

    // Cleanup
    return () => {};
  }, [editor, updateState, apiId]);

  return (
    <div className="flex flex-col h-full bg-background text-primary">
      {/* Header section - fixed */}
      <div className="fixed-header">
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
              <MenubarItem className="hover:bg-muted">
                Export as PDF
              </MenubarItem>
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
              <MenubarItem
                className="hover:bg-muted"
                onClick={() => editor?.commands.undo()}
                disabled={!editor?.can().chain().focus().undo().run()}
              >
                Undo
                <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                className="hover:bg-muted"
                onClick={() => editor?.commands.redo()}
                disabled={!editor?.can().chain().focus().redo().run()}
              >
                Redo
                <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                className="hover:bg-muted"
                onClick={() => {
                  editor?.chain().focus().selectAll().run();
                  document.execCommand("copy");
                }}
              >
                Copy
                <MenubarShortcut>⌘C</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                className="hover:bg-muted"
                onClick={() => {
                  editor?.chain().focus().selectAll().run();
                  document.execCommand("cut");
                }}
              >
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
              <MenubarItem className="hover:bg-muted">
                Page Setup...
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
              Help
            </WindowsMenubarTrigger>
            <WindowsMenubarContent>
              <MenubarItem className="hover:bg-muted">
                Documentation
              </MenubarItem>
              <MenubarItem className="hover:bg-muted">
                Keyboard Shortcuts
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem className="hover:bg-muted">
                About Word Editor
              </MenubarItem>
            </WindowsMenubarContent>
          </MenubarMenu>
        </WindowsMenubar>
        {/* Toolbar with Windows-styled controls */}{" "}
        <WordEditorToolbar editor={editor} />
      </div>

      {/* Document page view - scrollable area */}
      <div className="document-container-wrapper">
        <WordEditorContent editor={editor} documentName={documentName} />
      </div>

      {/* Status bar - fixed at bottom */}
      <div className="fixed-status-bar px-4 py-1 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span>Words: {editor?.storage.characterCount.words() || 0}</span>
          <span>
            Characters: {editor?.storage.characterCount.characters() || 0}
          </span>
        </div>
        <div>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};

export default WordEditor;
