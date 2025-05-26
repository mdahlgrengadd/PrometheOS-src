import React from 'react';
import { Plugin } from '../../types';
import { manifest } from './manifest';
import { PyodideTest } from './PyodideTest';

const PyodideTestPlugin: Plugin = {
  id: manifest.id,
  manifest,
  
  init: async () => {
    console.log('Pyodide Test plugin initialized');
  },
  
  render: () => {
    return <PyodideTest />;
  },
  
  onOpen: () => {
    console.log('Pyodide Test plugin opened');
  },
  
  onClose: () => {
    console.log('Pyodide Test plugin closed');
  },
};

export default PyodideTestPlugin;
