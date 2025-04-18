import React from 'react';

import { ApiTextareaWithHandler, textareaApiDoc } from '@/components/api/ApiTextarea';

import { Plugin, PluginManifest } from '../../types';

export const manifest: PluginManifest = {
  id: "notepad",
  name: "Notepad",
  version: "1.0.0",
  description: "A simple text editor",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34688_ans_beos_ans_beos.png"
      className="h-8 w-8"
      alt="Notepad"
    />
  ),
  entry: "apps/notepad",
  preferredSize: {
    width: 500,
    height: 400,
  },
};

// Create a separate React component for the Notepad
const NotepadComponent: React.FC = () => {
  // State to manage the textarea content
  const [noteContent, setNoteContent] = React.useState<string>("");

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("Notepad text changed:", e.target.value);
    setNoteContent(e.target.value);
  };

  // Log state changes for debugging
  React.useEffect(() => {
    console.log("Notepad state updated, current content:", noteContent);
  }, [noteContent]);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-medium">Notepad</h2>
        <div className="text-xs text-gray-500">
          {noteContent.length} characters
        </div>
      </div>

      {/* API-enabled textarea for AI interaction */}
      <ApiTextareaWithHandler
        apiId="notepad-text-editor"
        className="flex-1 w-full p-2 border border-gray-300 rounded resize-none"
        placeholder="Type your notes here..."
        value={noteContent}
        onChange={handleTextChange}
        // Only override specific properties, the rest come from default textareaApiDoc
        api={{
          description: "Notepad text editor for creating and editing notes",
          type: "NotepadEditor",
          path: "/apps/notepad/editor",
          // Keep default state properties plus add value
          state: {
            enabled: true,
            visible: true,
            value: noteContent, // Ensure current value is passed
          },
          // Use the actions from the textareaApiDoc
          actions: textareaApiDoc.actions,
        }}
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
