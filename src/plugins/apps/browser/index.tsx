import React from 'react';

import { Plugin, PluginManifest } from '../../types';

export const manifest: PluginManifest = {
  id: "browser",
  name: "Browser",
  version: "1.0.0",
  description: "A simple web browser",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34686_acrobat_beos_acrobat_beos.png"
      className="h-8 w-8"
      alt="Browser"
    />
  ),
  entry: "apps/browser",
};

const BrowserPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Browser plugin initialized");
  },
  render: () => {
    return (
      <div className="p-4 flex flex-col h-full">
        <div className="flex mb-2">
          <input
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 rounded-l"
            placeholder="Enter URL..."
            defaultValue="https://example.com"
          />
          <button className="bg-blue-500 text-white px-3 py-1 rounded-r">
            Go
          </button>
        </div>
        <div className="flex-1 bg-white border border-gray-300 p-4">
          <div className="text-center py-8">
            <h1 className="text-xl font-bold">Example Domain</h1>
            <p className="mt-4">
              This domain is for use in illustrative examples in documents.
            </p>
            <p className="mt-2">
              You may use this domain in literature without prior coordination.
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export default BrowserPlugin;
