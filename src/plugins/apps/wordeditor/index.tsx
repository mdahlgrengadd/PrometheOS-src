import React from 'react';
import { Plugin, PluginManifest } from '../../types';

export const manifest: PluginManifest = {
  id: "wordeditor",
  name: "Word Editor",
  version: "1.0.0",
  description: "A word processing application",
  author: "Desktop System",
  icon: <img src="/icons/34684_aim_be_be_aim.png" className="h-8 w-8" alt="Word Editor" />,
  entry: "apps/wordeditor"
};

const WordEditorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Word Editor plugin initialized");
  },
  render: () => {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="mb-2 p-1 bg-gray-100 border-b flex space-x-1">
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">File</button>
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">Edit</button>
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">View</button>
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">Insert</button>
          <button className="px-2 py-1 bg-white border border-gray-300 rounded text-sm">Format</button>
        </div>
        <div className="mb-2 p-1 flex space-x-1">
          <button className="p-1 bg-white border border-gray-300 rounded text-sm">B</button>
          <button className="p-1 bg-white border border-gray-300 rounded text-sm">I</button>
          <button className="p-1 bg-white border border-gray-300 rounded text-sm">U</button>
          <select className="border border-gray-300 text-sm p-1">
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Courier New</option>
          </select>
          <select className="border border-gray-300 text-sm p-1">
            <option>12</option>
            <option>14</option>
            <option>16</option>
          </select>
        </div>
        <div className="flex-1">
          <textarea 
            className="w-full h-full p-2 border border-gray-300"
            placeholder="Type your document here..."
          />
        </div>
      </div>
    );
  }
};

export default WordEditorPlugin;
