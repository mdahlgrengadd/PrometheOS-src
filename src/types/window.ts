import React from 'react';

// Represents the state of a single window
export interface WindowState {
  id: string;
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  previousPosition?: { x: number; y: number };
  previousSize?: { width: number | string; height: number | string };
  isMaximized?: boolean;
  /**
   * If true, the window manager should not render window chrome (titlebar, controls, etc)
   * and should let the app render its own UI edge-to-edge.
   */
  hideWindowChrome?: boolean;
}

// Dictionary of windows by ID
export type WindowsDict = Record<string, WindowState>;

// Interface for the window store
export interface WindowStore {
  windows: WindowsDict;
  highestZ: number;

  /* Actions */
  registerWindow: (w: WindowState) => void;
  setOpen: (id: string, open: boolean) => void;
  minimize: (id: string, v?: boolean) => void;
  maximize: (id: string) => void; // toggle
  move: (id: string, pos: { x: number; y: number }) => void;
  resize: (
    id: string,
    size: { width: number | string; height: number | string }
  ) => void;
  focus: (id: string) => void;
  close: (id: string) => void;
  reset: () => void; // Reset the store to initial state

  // New update functions that don't affect z-index
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  updateWindows: (updates: Record<string, Partial<WindowState>>) => void;
}
