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
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import { Code, Type } from "lucide-react"; 
import { Toggle } from "@/components/ui/toggle";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut
} from "@/components/ui/menubar";

const WordEditor = () => {
  const [documentName, setDocumentName] = useState("Untitled Document");
  const [isMarkdown, setIsMarkdown] = useState(false);
  
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
    editable: !isMarkdown,
  });

  const toggleView = () => {
    setIsMarkdown(!isMarkdown);
    if (editor) {
      editor.setEditable(!isMarkdown);
    }
  };

  // Convert HTML content to basic markdown
  const htmlToMarkdown = (html: string) => {
    if (!html) return '';
    
    // Basic replacements for common HTML elements
    let markdown = html;
    
    // Replace headings
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
    
    // Replace paragraphs
    markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
    
    // Replace bold
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    
    // Replace italic
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    
    // Replace links
    markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
    
    // Replace lists
    markdown = markdown.replace(/<ul>(.*?)<\/ul>/gs, (match, content) => {
      return content.replace(/<li>(.*?)<\/li>/g, '- $1\n');
    });
    
    markdown = markdown.replace(/<ol>(.*?)<\/ol>/gs, (match, content) => {
      let index = 1;
      return content.replace(/<li>(.*?)<\/li>/g, () => `${index++}. $1\n`);
    });
    
    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '');
    
    return markdown;
  };

  const getMarkdownContent = () => {
    if (!editor) return '';
    return htmlToMarkdown(editor.getHTML());
  };

  return (
    <div className="flex flex-col h-full bg-white text-black">
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
      
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50">
        <Toggle
          pressed={isMarkdown}
          onPressedChange={toggleView}
          className="gap-2"
          aria-label="Toggle editor view"
        >
          {isMarkdown ? (
            <>
              <Code className="h-4 w-4" />
              <span>Markdown</span>
            </>
          ) : (
            <>
              <Type className="h-4 w-4" />
              <span>WYSIWYG</span>
            </>
          )}
        </Toggle>
      </div>
      
      {!isMarkdown && <WordEditorToolbar editor={editor} />}
      
      <div className="flex-grow overflow-auto bg-white">
        {isMarkdown ? (
          <div className="w-[8.5in] mx-auto my-4 min-h-[11in] shadow-lg bg-white p-8 border border-gray-300">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {getMarkdownContent()}
            </pre>
          </div>
        ) : (
          <WordEditorContent editor={editor} documentName={documentName} />
        )}
      </div>
      
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
