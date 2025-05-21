import React from 'react';

import { WindowsWindow } from '@/components/franky-ui-kit/Window';
import { useTheme } from '@/lib/ThemeProvider';

import { UnifiedWindowShellV2 } from './UnifiedWindowShellV2';

interface WindowShellProps {
  id: string;
  title: string;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  isMaximized: boolean;
  isOpen: boolean;
  isMinimized: boolean;
  isFocused?: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onResize: (size: { width: number | string; height: number | string }) => void;
  children: React.ReactNode;
  hideWindowChrome?: boolean;
}

/**
 * WindowShell - A wrapper component that decides whether to use UnifiedWindowShell
 *
 * This component currently delegates to:
 * - WindowsWindow for Windows themes (win98, winxp, win7)
 * - UnifiedWindowShell for all other themes
 *
 * In the future, this will be completely replaced by UnifiedWindowShell for all themes.
 */
export const WindowShell: React.FC<WindowShellProps> = (props) => {
  const { theme } = useTheme();
  const {
    id,
    title,
    zIndex,
    position,
    size,
    isMaximized,
    isOpen,
    isMinimized,
    isFocused,
    onClose,
    onMinimize,
    onMaximize,
    onFocus,
    onDragEnd,
    onResize,
    children,
    hideWindowChrome,
  } = props;

  // Check if using a Windows theme
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  if (!isOpen) return null;

  // If using a Windows theme, render the WindowsWindow component
  // This is temporary until we've fully migrated to UnifiedWindowShell
  if (isWindowsTheme) {
    return (
      <WindowsWindow
        id={id}
        title={title}
        zIndex={zIndex}
        position={position}
        size={size}
        isMaximized={isMaximized}
        isOpen={isOpen}
        isMinimized={isMinimized}
        isFocused={isFocused}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onFocus={onFocus}
        onDragEnd={onDragEnd}
        onResize={onResize}
        hideWindowChrome={hideWindowChrome}
      >
        {children}
      </WindowsWindow>
    );
  }

  // For all other themes, use our new UnifiedWindowShellV2
  // For all other themes, use our new UnifiedWindowShellV2
  // BeOS: headerFullWidth = false, all others: true (default)
  return (
    <UnifiedWindowShellV2
      id={id}
      title={title}
      zIndex={zIndex}
      position={position}
      size={size}
      isMaximized={isMaximized}
      isOpen={isOpen}
      isMinimized={isMinimized}
      isFocused={isFocused}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      onFocus={onFocus}
      onDragEnd={onDragEnd}
      onResize={onResize}
      hideWindowChrome={hideWindowChrome}
      headerFullWidth={theme !== "beos"}
    >
      {children}
    </UnifiedWindowShellV2>
  );
};
