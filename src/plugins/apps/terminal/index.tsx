import React from 'react';

import { manifest } from './manifest';
import TerminalApp from './ui';

const TerminalPlugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    // Terminal initialization logic if needed
    console.log("Terminal plugin initialized");
  },
  render: () => <TerminalApp />,
};

export default TerminalPlugin;
