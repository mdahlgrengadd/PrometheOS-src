import React from 'react';

import { Plugin, PluginInitData } from '../../types';
import App from './App';
import './index.css';
import { manifest } from './manifest';

// ZetaWriter Plugin Component
const ZetaWriterComponent: React.FC<{ initData?: PluginInitData }> = ({
  initData,
}) => {
  // ZetaWriter App already handles initialization and rendering
  return <App />;
};

// Global state for init data - simple approach for this demo
let globalInitData: PluginInitData | undefined;

const ZetaWriterPlugin: Plugin = {
  id: manifest.id,
  manifest,

  init: async (initData?: PluginInitData) => {
    console.log(
      "ZetaWriter plugin initialized",
      initData ? "with init data" : "without init data"
    );
    globalInitData = initData;
  },

  onOpen: (initData?: PluginInitData) => {
    console.log(
      "ZetaWriter plugin opened",
      initData ? "with init data" : "without init data"
    );
    // Update init data when opened with new data
    if (initData) {
      globalInitData = initData;
    }
  },

  render: () => {
    return <ZetaWriterComponent initData={globalInitData} />;
  },
};

export default ZetaWriterPlugin;
