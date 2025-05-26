import './index.css';
import './styles.css';

//import './styles.css';
import React from 'react';

import { Plugin } from '../../types';
import IdeLayout from './layout/IdeLayout'; // Import the IDE styles
import { manifest } from './manifest';

// Create the plugin component
const BuilderComponent: React.FC = () => {
  return (
    <div
      className="ide-builder-app h-full w-full overflow-hidden"
      style={{ height: "100%", width: "100%" }}
    >
      <IdeLayout />
    </div>
  );
};

// Create and export the plugin
const BuilderPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Builder IDE plugin initialized");
  },
  render: () => <BuilderComponent />,
  onOpen: () => {
    console.log("Builder IDE opened");
  },
  onClose: () => {
    console.log("Builder IDE closed");
  },
};

export default BuilderPlugin;
