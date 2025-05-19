import React from "react";

import { Editor, EditorContent } from "@tiptap/react";

interface WordEditorContentProps {
  editor: Editor | null;
  documentName: string;
}

const WordEditorContent = ({
  editor,
  documentName,
}: WordEditorContentProps) => {
  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="document-scroll-container">
      <div className="document-page">
        <div className="mb-4">
          <h1 className="text-2xl font-medium text-center">{documentName}</h1>
        </div>
        <EditorContent editor={editor} className="editor-content-area" />
      </div>
    </div>
  );
};

export default WordEditorContent;
