import React from 'react';

import { Plugin, PluginManifest } from '../../types';
import CalculatorContent from './CalculatorContent';

export const manifest: PluginManifest = {
  id: "calculator",
  name: "Calculator",
  version: "1.0.0",
  description: "A simple calculator",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34689_beos_blocks_cubos_serv_app_beos_blocks_cubos_serv_app.png"
      className="h-8 w-8"
      alt="Calculator"
    />
  ),
  entry: "apps/calculator",
  preferredSize: {
    width: 320,
    height: 400,
  },
};

const CalculatorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Calculator plugin initialized");
  },
  render: () => {
    return <CalculatorContent />;
  },
};

export default CalculatorPlugin;
