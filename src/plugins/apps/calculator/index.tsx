import React from 'react';

import { Plugin } from '../../types';
import { manifest } from './manifest';
import CalculatorContent from './ui';

/**
 * Calculator plugin
 */
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
