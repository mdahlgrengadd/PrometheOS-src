import {
    AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, CheckSquare, Code as CodeIcon, Heading1,
    Heading2, Highlighter, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Redo,
    RotateCcw, Strikethrough, Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
    Underline as UnderlineIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SelectContent, SelectTrigger } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
// Windows-themed components
import {
    Button as WindowsButton, SelectGroup, SelectItem, SelectValue, WindowsSelect
} from '@/components/ui/windows';
import { cn } from '@/lib/utils';
import { Editor } from '@tiptap/react';

interface WordEditorToolbarProps {
  editor: Editor | null;
}

const WordEditorToolbar = ({ editor }: WordEditorToolbarProps) => {
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#FFFF00");
  const [currentFontFamily, setCurrentFontFamily] = useState("Arial");
  const [currentFontSize, setCurrentFontSize] = useState("12px");

  // Update current values when editor selection changes
  useEffect(() => {
    if (!editor) return;

    const updateCurrentValues = () => {
      const { textStyle } = editor.getAttributes("textStyle") || {};
      const { highlight } = editor.getAttributes("highlight") || {};
      if (textStyle) {
        setCurrentColor(textStyle.color || "#000000");
        setCurrentFontFamily(textStyle.fontFamily || "Arial");
        setCurrentFontSize(textStyle.fontSize || "12px");
      }
      if (highlight && highlight.color) {
        setCurrentHighlightColor(highlight.color);
      }
    };

    editor.on("selectionUpdate", updateCurrentValues);
    editor.on("transaction", updateCurrentValues);

    return () => {
      editor.off("selectionUpdate", updateCurrentValues);
      editor.off("transaction", updateCurrentValues);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Add link handler
  const setLink = () => {
    const url = window.prompt("URL");

    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
  };

  // Add image handler
  const addImage = () => {
    const url = window.prompt("URL");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border-b border-border px-3 py-1 flex flex-wrap gap-1 items-center bg-muted/50">
      {/* Font Family & Size */}
      <div className="flex items-center gap-1">
        <WindowsSelect
          value={currentFontFamily}
          onValueChange={(value) => {
            setCurrentFontFamily(value);
            editor.chain().focus().setFontFamily(value).run();
          }}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue placeholder="Arial" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Calibri">Calibri</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
            </SelectGroup>
          </SelectContent>
        </WindowsSelect>

        <WindowsSelect
          value={currentFontSize.replace("px", "")}
          onValueChange={(value) => {
            const fontSize = `${value}px`;
            setCurrentFontSize(fontSize);
            editor.chain().focus().setFontSize(fontSize).run();
          }}
        >
          <SelectTrigger className="h-8 w-[60px]">
            <SelectValue placeholder="12" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="28">28</SelectItem>
              <SelectItem value="32">32</SelectItem>
            </SelectGroup>
          </SelectContent>
        </WindowsSelect>
      </div>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Basic Formatting */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn("px-2 h-8 w-8", editor.isActive("bold") && "bg-muted")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn("px-2 h-8 w-8", editor.isActive("italic") && "bg-muted")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("underline") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn("px-2 h-8 w-8", editor.isActive("strike") && "bg-muted")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </WindowsButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Heading Styles */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("heading", { level: 1 }) && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("heading", { level: 2 }) && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </WindowsButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Lists */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("bulletList") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("orderedList") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </WindowsButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Alignment */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive({ textAlign: "left" }) && "bg-muted"
        )}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive({ textAlign: "center" }) && "bg-muted"
        )}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive({ textAlign: "right" }) && "bg-muted"
        )}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive({ textAlign: "justify" }) && "bg-muted"
        )}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="h-4 w-4" />
      </WindowsButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Link and Media */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn("px-2 h-8 w-8", editor.isActive("link") && "bg-muted")}
        onClick={setLink}
      >
        <LinkIcon className="h-4 w-4" />
      </WindowsButton>{" "}
      <WindowsButton
        variant="ghost"
        size="sm"
        className="px-2 h-8 w-8"
        onClick={addImage}
      >
        <ImageIcon className="h-4 w-4" />
      </WindowsButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Superscript, Subscript */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("superscript") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <SuperscriptIcon className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("subscript") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <SubscriptIcon className="h-4 w-4" />
      </WindowsButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Task List */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("taskList") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <CheckSquare className="h-4 w-4" />
      </WindowsButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Code and Highlight */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn("px-2 h-8 w-8", editor.isActive("code") && "bg-muted")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <CodeIcon className="h-4 w-4" />
      </WindowsButton>{" "}
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("highlight") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("subscript") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <SubscriptIcon className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("superscript") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <SuperscriptIcon className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className={cn(
          "px-2 h-8 w-8",
          editor.isActive("taskList") && "bg-muted"
        )}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <CheckSquare className="h-4 w-4" />
      </WindowsButton>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <WindowsButton variant="ghost" size="sm" className="px-2 h-8">
            <div
              className="w-4 h-4 rounded border border-gray-400"
              style={{ backgroundColor: currentColor }}
            />
          </WindowsButton>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2">
          <div className="grid grid-cols-5 gap-1 color-picker-grid">
            {[
              "#000000",
              "#FF0000",
              "#00FF00",
              "#0000FF",
              "#FFFF00",
              "#FF00FF",
              "#00FFFF",
              "#FFFFFF",
              "#808080",
              "#FF8000",
              "#800080",
              "#008000",
              "#800000",
              "#008080",
              "#000080",
            ].map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 color-picker-button"
                style={{
                  backgroundColor: color,
                  // Override any theme background with the actual color
                  backgroundImage: "none !important",
                }}
                onClick={() => {
                  setCurrentColor(color);
                  editor.chain().focus().setColor(color).run();
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {/* Highlight Color */}
      <Popover>
        <PopoverTrigger asChild>
          <WindowsButton variant="ghost" size="sm" className="px-2 h-8">
            <div className="relative">
              <Highlighter className="h-4 w-4" />
              <div
                className="absolute -bottom-0.5 left-0 right-0 h-1 rounded"
                style={{ backgroundColor: currentHighlightColor }}
              />
            </div>
          </WindowsButton>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2">
          <div className="grid grid-cols-5 gap-1 color-picker-grid">
            {[
              "#FFFF00", // Yellow
              "#00FF00", // Green
              "#FF00FF", // Magenta
              "#00FFFF", // Cyan
              "#FF8000", // Orange
              "#FF0000", // Red
              "#0000FF", // Blue
              "#800080", // Purple
              "#808080", // Gray
              "#FFB6C1", // Light Pink
              "#90EE90", // Light Green
              "#ADD8E6", // Light Blue
              "#F0E68C", // Khaki
              "#DDA0DD", // Plum
              "#FFFFFF", // White (remove highlight)
            ].map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 color-picker-button"
                style={{
                  backgroundColor: color,
                  backgroundImage: "none !important",
                }}
                onClick={() => {
                  setCurrentHighlightColor(color);
                  if (color === "#FFFFFF") {
                    editor.chain().focus().unsetHighlight().run();
                  } else {
                    editor.chain().focus().toggleHighlight({ color }).run();
                  }
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Undo and Redo */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className="px-2 h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <RotateCcw className="h-4 w-4" />
      </WindowsButton>
      <WindowsButton
        variant="ghost"
        size="sm"
        className="px-2 h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </WindowsButton>
      {/* Clear Styling */}
      <WindowsButton
        variant="ghost"
        size="sm"
        className="px-2 h-8"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        Clear formatting
      </WindowsButton>
    </div>
  );
};

export default WordEditorToolbar;
