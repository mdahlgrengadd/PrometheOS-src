import React from 'react';

import { Plugin } from '../../types';
import Background3D from './components/Background3D';
import { manifest } from './manifest';

/**
 * Desktop 3D Demo Component - A standalone 3D environment demonstration
 */
const Desktop3DDemo: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Use Background3D with 3D environment enabled */}
      <Background3D containerRef={containerRef} use3D={true} />

      {/* Demo content overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8 text-white text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4">Desktop 3D Environment</h1>
          <p className="text-lg opacity-90 mb-6">
            A demonstration of the 3D desktop background component with dynamic
            environments.
          </p>
          <p className="text-sm opacity-75">
            This component is used as the background for the main 3D desktop
            environment.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Desktop 3D plugin - A standalone 3D environment demonstration
 * This is different from the main Desktop3D component used by the desktop
 */
const Desktop3DPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Desktop 3D plugin initialized");
  },
  render: () => <Desktop3DDemo />,
};

export default Desktop3DPlugin;
