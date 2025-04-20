import React from 'react';

import ApiFlowEditorPlugin from '../plugins/apps/api-flow-editor';

const ApiFlowEditor: React.FC = () => {
  // Render the plugin's main component
  return ApiFlowEditorPlugin.render();
};

export default ApiFlowEditor;
