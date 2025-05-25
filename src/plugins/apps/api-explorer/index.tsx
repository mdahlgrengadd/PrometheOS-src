import React from 'react';

import { Plugin } from '../../types';
import ApiExplorerSwitcher from './components/ApiExplorerSwitcher';
import { manifest } from './manifest';

/**
 * API Explorer plugin that integrates with the PrometheOS API system
 * providing both a Swagger UI (FastAPI style) view and a custom explorer view
 */
const ApiExplorerPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("API Explorer plugin initialized");
  },
  render: () => {
    return <ApiExplorerSwitcher />;
  },
};

export default ApiExplorerPlugin;
