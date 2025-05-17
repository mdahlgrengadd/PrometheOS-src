import React from 'react';

import { Plugin } from '../../types';
import { manifest } from './manifest';
import SettingsContent from './ui';

const SettingsPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Settings plugin initialized");
  },
  render: () => {
    return <SettingsContent />;
  },
};

export default SettingsPlugin;
