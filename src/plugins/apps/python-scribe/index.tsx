import React from 'react';

import { Plugin } from '../../types';
import { manifest } from './manifest';
import PythonCodeEditor from './components/PythonCodeEditor';

/**
 * Python Scribe plugin
 */
const PythonScribePlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Python Scribe plugin initialized");
  },
  render: () => {
    return <PythonCodeEditor />;
  },
};

export default PythonScribePlugin;
