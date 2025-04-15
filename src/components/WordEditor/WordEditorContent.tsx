
import React from "react";
import { Editor, EditorContent } from "@tiptap/react";

interface WordEditorContentProps {
  editor: Editor | null;
  documentName: string;
}

const WordEditorContent = ({ editor, documentName }: WordEditorContentProps) => {
  if (!editor) {
    return <div className="h-full flex items-center justify-center">Loading editor...</div>;
  }

  return (
    <div className="relative h-full">
      {/* Document Page */}
      <div className="mx-auto my-4 w-[8.5in] min-h-[11in] shadow-lg bg-white p-8 border border-gray-300">
        <div className="mb-4">
          <h1 className="text-2xl font-medium text-center">{documentName}</h1>
        </div>
        <EditorContent editor={editor} className="h-full min-h-[10in]" />
      </div>
    </div>
  );
};

export default WordEditorContent;
