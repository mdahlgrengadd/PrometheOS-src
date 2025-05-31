import React from 'react';

import { Plugin } from '../../types';
import { manifest } from './manifest';
import PythonCodeEditor from './components/PythonCodeEditor';

/**
 * PyServe plugin
 */
const PythonScribePlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("PyServe plugin initialized");
  },
  render: () => {
    return <PythonCodeEditor />;
  },
};

export default PythonScribePlugin;
