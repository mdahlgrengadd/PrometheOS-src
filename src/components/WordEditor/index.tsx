
import React, { useState } from "react";
import WordEditorToolbar from "./WordEditorToolbar";
import WordEditorContent from "./WordEditorContent";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";  // Ensure this import is correct
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import { 
  Menubar, 
  MenubarMenu, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator, 
  MenubarTrigger,
  MenubarShortcut
} from "@/components/ui/menubar";

const WordEditor = () => {
  const [documentName, setDocumentName] = useState("Untitled Document");
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'mx-auto max-w-full h-auto',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
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
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none p-4',
      },
    },
  });

  // Rename document handler
  const handleRename = (name: string) => {
    setDocumentName(name);
  };

  return (
    <div className="flex flex-col h-full bg-white text-black">
      {/* Menu Bar */}
      <Menubar className="rounded-none border-b border-gray-200">
        <MenubarMenu>
          <MenubarTrigger className="font-normal">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Document
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Open...
              <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              Save
              <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Export as PDF</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className="font-normal">Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem 
              onClick={() => editor?.commands.undo()}
              disabled={!editor?.can().chain().focus().undo().run()}
            >
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem 
              onClick={() => editor?.commands.redo()}
              disabled={!editor?.can().chain().focus().redo().run()}
            >
              Redo
              <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem 
              onClick={() => {
                editor?.chain().focus().selectAll().run();
                document.execCommand('copy');
              }}
            >
              Copy
              <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem 
              onClick={() => {
                editor?.chain().focus().selectAll().run();
                document.execCommand('cut');
              }}
            >
              Cut
              <MenubarShortcut>⌘X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => document.execCommand('paste')}>
              Paste
              <MenubarShortcut>⌘V</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className="font-normal">View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Zoom In</MenubarItem>
            <MenubarItem>Zoom Out</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Full Screen</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className="font-normal">Format</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Font...</MenubarItem>
            <MenubarItem>Paragraph...</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Bullets & Numbering</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Headers & Footers</MenubarItem>
            <MenubarItem>Page Setup...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className="font-normal">Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Documentation</MenubarItem>
            <MenubarItem>Keyboard Shortcuts</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>About Word Editor</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      
      {/* Toolbar */}
      <WordEditorToolbar editor={editor} />
      
      {/* Content Area */}
      <div className="flex-grow overflow-auto bg-white">
        <WordEditorContent editor={editor} documentName={documentName} />
      </div>
      
      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-1 text-xs flex justify-between items-center bg-gray-50">
        <div className="flex items-center space-x-4">
          <span>Words: {editor?.storage.characterCount.words() || 0}</span>
          <span>Characters: {editor?.storage.characterCount.characters() || 0}</span>
        </div>
        <div>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};

export default WordEditor;
