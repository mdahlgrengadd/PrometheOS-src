import React, { useState } from "react";

import { SessionDialog } from "@/components/SessionDialog";

import { Plugin, PluginManifest } from "../../types";

export const manifest: PluginManifest = {
  id: "session",
  name: "Session",
  version: "1.0.0",
  description: "Share your desktop with others using WebRTC",
  author: "Desktop System",
  icon: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8"
    >
      <path
        d="M17 9V7C17 4.79086 15.2091 3 13 3H7C4.79086 3 3 4.79086 3 7V13C3 15.2091 4.79086 17 7 17H9"
        stroke="#000000"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="9"
        y="9"
        width="12"
        height="12"
        rx="2"
        stroke="#000000"
        strokeWidth="2"
      />
      <path
        d="M15 15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15Z"
        stroke="#000000"
        strokeWidth="2"
      />
    </svg>
  ),
  entry: "apps/session",
  preferredSize: {
    width: 580,
    height: 600,
  },
};

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
          <h2 className="text-xl font-semibold mb-4">Session Manager</h2>
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
    console.log("Session plugin initialized");
  },
  render: () => {
    return <SessionComponent />;
  },
};

export default SessionPlugin;
