
import React from 'react';
import { FolderOpen } from 'lucide-react';

import { Plugin } from '../../types';
import FileBrowserContent from './components/FileBrowserContent';

// Define the manifest for the File Browser plugin
import { manifest } from './manifest';

// Define the File Browser plugin
const FileBrowserPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log(
      "File Browser plugin initialized - " + new Date().toISOString()
    );
  },
  render: () => {
    return <FileBrowserContent />;
  },
};

export default FileBrowserPlugin;

