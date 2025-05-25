import React from 'react';
import FileExplorer from './components/FileExplorer';
import { manifest } from './manifest';
import { Plugin } from '../../types';

const FileExplorerPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    // Any initialization logic if needed
    // console.log('File Explorer plugin initialized');
  },
  render: () => <FileExplorer />,
  onOpen: () => {},
  onClose: () => {},
};

export default FileExplorerPlugin;
