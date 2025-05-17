import React from 'react';
import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "session",
  name: "P2P Session",
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
  // Uncomment if your plugin has a worker component
  // workerEntrypoint: "session.js", 
  preferredSize: {
    width: 600,
    height: 400,
  },
}; 
