import './index.css';
import './styles.css';

//import './styles.css';
import React from 'react';

import { Plugin, PluginInitData } from '../../types';
import IdeLayout from './layout/IdeLayout'; // Import the IDE styles
import { manifest } from './manifest';

// Global state for init data - simple approach for this demo
let globalInitData: PluginInitData | undefined;

// Create the plugin component
const BuilderComponent: React.FC<{ initData?: PluginInitData }> = ({ initData }) => {
  return (
    <div
      className="ide-builder-app h-full w-full overflow-hidden"
      style={{ height: "100%", width: "100%" }}
    >
      <IdeLayout initData={initData} />
    </div>
  );
};

// Create and export the plugin
const BuilderPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async (initData?: PluginInitData) => {
    console.log("Builder IDE plugin initialized", initData ? "with init data" : "without init data");
    globalInitData = initData;
  },
  render: () => <BuilderComponent initData={globalInitData} />,
  onOpen: (initData?: PluginInitData) => {
    console.log("Builder IDE opened", initData ? "with init data" : "without init data");
    // Update init data when opened with new data
    if (initData) {
      globalInitData = initData;
    }
  },
  onClose: () => {
    console.log("Builder IDE closed");
  },
};

export default BuilderPlugin;
