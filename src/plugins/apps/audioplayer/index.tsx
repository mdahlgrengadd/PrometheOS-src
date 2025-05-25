import { Music } from 'lucide-react';
import React from 'react';

import { Plugin } from '../../types';
// Ensure icon path is correct and valid
import { manifest } from './manifest';
import AudioPlayerContent from './ui';

const AudioPlayerPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log(
      "Audio Player plugin initialized - " + new Date().toISOString()
    );
  },
  render: () => {
    return <AudioPlayerContent />;
  },
};

// Make sure default export is properly defined
export default AudioPlayerPlugin;
