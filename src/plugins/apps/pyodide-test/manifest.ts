import { PluginManifest } from "../../types";
import React from 'react';

export const manifest: PluginManifest = {
  id: "pyodide-test",
  name: "Python Notebook",
  description: "Jupyter-style Python notebook with Pyodide integration",
  version: "1.0.0",
  author: "Desktop Dreamscape",
  icon: React.createElement('div', { className: 'w-6 h-6 bg-blue-500 rounded' }),
  entry: "index.tsx",
  // Use relative path; loader will prepend base path automatically
  workerEntrypoint: "worker/pyodide.js",
  iconUrl: import.meta.env.BASE_URL + "icons/python-icon.png",
  preferredSize: {
    width: 1200,
    height: 800,
  },
};
