import React, { useState } from 'react';

import { SessionDialog } from '@/components/SessionDialog';

import { Plugin } from '../../types';

import { manifest } from './manifest';

// Create a separate React component for the Session
const SessionComponent: React.FC = () => {
  const [dialogVisible, setDialogVisible] = useState(true);

  const handleClose = () => {
    // Just hide the dialog, don't actually close it
    // This ensures WebRTC connections persist even when UI is hidden
    setDialogVisible(false);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {dialogVisible ? (
        <SessionDialog onClose={handleClose} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">P2P Session Manager</h2>
          <p className="text-gray-600 text-center mb-6">
            WebRTC connection is running in the background.
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setDialogVisible(true)}
          >
            Show Connection Dialog
          </button>
        </div>
      )}
    </div>
  );
};

const SessionPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("P2P Session plugin initialized");
  },
  render: () => {
    return <SessionComponent />;
  },
};

export default SessionPlugin;

