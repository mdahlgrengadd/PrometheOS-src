import { Code, Type } from 'lucide-react';
import React, { useState } from 'react';

import {
    Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut,
    MenubarTrigger
} from '@/components/ui/menubar';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import WordEditorContent from './WordEditorContent';
import WordEditorToolbar from './WordEditorToolbar';

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
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      CharacterCount,
    ],
    content: `
      <h1>Welcome to Word Editor</h1>
      <p>This is a professional word processor built with TipTap.</p>
      <p>Try formatting this text or adding your own content!</p>
    `,
    autofocus: true,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none p-4",
      },
    },
    editable: true,
  });

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <Menubar className="rounded-none border-b border-border">
        <MenubarMenu>
          <MenubarTrigger className="font-normal">File</MenubarTrigger>
          <MenubarContent className="bg-popover border rounded-md shadow-md z-50">
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
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-normal">Edit</MenubarTrigger>
          <MenubarContent className="bg-popover border rounded-md shadow-md z-50">
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
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-normal">View</MenubarTrigger>
          <MenubarContent className="bg-popover border rounded-md shadow-md z-50">
            <MenubarItem className="hover:bg-muted">Zoom In</MenubarItem>
            <MenubarItem className="hover:bg-muted">Zoom Out</MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted">Full Screen</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-normal">Format</MenubarTrigger>
          <MenubarContent className="bg-popover border rounded-md shadow-md z-50">
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
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="font-normal">Help</MenubarTrigger>
          <MenubarContent className="bg-popover border rounded-md shadow-md z-50">
            <MenubarItem className="hover:bg-muted">Documentation</MenubarItem>
            <MenubarItem className="hover:bg-muted">
              Keyboard Shortcuts
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem className="hover:bg-muted">
              About Word Editor
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <WordEditorToolbar editor={editor} />

      <div className="flex-grow overflow-auto bg-background">
        <WordEditorContent editor={editor} documentName={documentName} />
      </div>

      <div className="border-t border-border px-4 py-1 text-xs flex justify-between items-center bg-muted/50">
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
