import React from 'react';
import { Plugin } from '../../types';
import { manifest } from './manifest';
import { PythonNotebook } from './PythonNotebook';

const PyodideTestPlugin: Plugin = {
  id: manifest.id,
  manifest,
  
  init: async () => {
    console.log('Python Notebook plugin initialized');
  },
  
  render: () => {
    return <PythonNotebook />;
  },
  
  onOpen: () => {
    console.log('Python Notebook plugin opened');
  },
  
  onClose: () => {
    console.log('Python Notebook plugin closed');
  },
};

export default PyodideTestPlugin;
