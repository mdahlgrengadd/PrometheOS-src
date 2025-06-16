import React, { useEffect, useState } from 'react';

import { useWindowStore } from '@/store/windowStore';
import { WindowState } from '@/types/window';

import { WindowShell } from '../shelley-wm/WindowShell';

interface WindowProps {
  window: WindowState;
  allWindows: WindowState[];
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragStop: (position: { x: number; y: number }) => void;
  onTabClick: (id: string) => void;
}

const AppWindow: React.FC<WindowProps> = ({
  window,
  allWindows,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDragStop,
  onTabClick,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Get store actions directly
  const focus = useWindowStore((state) => state.focus);
  const resize = useWindowStore((state) => state.resize);

  // Use the isMaximized flag from window state instead of calculating it
  const isMaximized = window.isMaximized === true;

  // Handle focus animation
  const handleFocus = () => {
    // Only call the props callback, which will emit the event that triggers the store action
    onFocus();

    setIsFocused(true); // Set focus state for animations

    // Reset focus state after animation completes
    setTimeout(() => {
      setIsFocused(false);
    }, 300);
  };

  // Handle resize
  const handleResize = (newSize: {
    width: number | string;
    height: number | string;
  }) => {
    resize(window.id, newSize);
  };

  if (!window.isOpen) return null;

  return (
    <WindowShell
      id={window.id}
      title={window.title}
      zIndex={window.zIndex}
      position={window.position}
      size={window.size}
      isMaximized={isMaximized}
      isOpen={window.isOpen}
      isMinimized={window.isMinimized}
      isFocused={isFocused}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      onFocus={handleFocus}
      onDragEnd={onDragStop}
      onResize={handleResize}
      hideWindowChrome={window.hideWindowChrome}
    >
      {window.content}
    </WindowShell>
  );
};

export default AppWindow;
