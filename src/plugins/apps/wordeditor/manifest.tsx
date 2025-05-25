import React from 'react';

import { PluginManifest } from '../../../plugins/types';
import { wordEditorApiDoc } from './WordEditor';

export const manifest: PluginManifest & { apiDoc?: typeof wordEditorApiDoc } = {
  id: "wordeditor",
  name: "Word Editor Pro",
  version: "1.0.0",
  description: "Advanced word processing application with rich text editing",
  author: "Desktop System",
  icon: (
    <img
      src={import.meta.env.BASE_URL + "/icons/34684_aim_be_be_aim.png"}
      className="h-8 w-8"
      alt="Word Editor Pro"
    />
  ),
  entry: "apps/wordeditor",
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "wordeditor.js",
  preferredSize: {
    width: 1024,
    height: 768,
  },
  apiDoc: wordEditorApiDoc,
};
