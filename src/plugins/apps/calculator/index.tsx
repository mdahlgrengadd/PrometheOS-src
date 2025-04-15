
import React from 'react';
import { Plugin, PluginManifest } from '../../types';
import { Calculator } from 'lucide-react';
import CalculatorContent from './CalculatorContent';

export const manifest: PluginManifest = {
  id: "calculator",
  name: "Calculator",
  version: "1.0.0",
  description: "A simple calculator",
  author: "Desktop System",
  icon: <Calculator className="h-8 w-8" />,
  entry: "apps/calculator"
};

const CalculatorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Calculator plugin initialized");
  },
  render: () => {
    // We're now returning a proper component instead of using hooks directly
    return <CalculatorContent />;
  }
};

export default CalculatorPlugin;
