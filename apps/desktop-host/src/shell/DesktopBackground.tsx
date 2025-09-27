// Desktop Background Component
import React from 'react';
import { useTheme } from '../core/ThemeProvider';

export const DesktopBackground: React.FC = () => {
  const { theme } = useTheme();

  const backgroundStyle: React.CSSProperties = {
    background: theme === 'beos'
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : theme === 'dark'
      ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
      : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    minHeight: '100vh',
    minWidth: '100vw',
  };

  return (
    <div
      className="desktop-background absolute inset-0"
      style={backgroundStyle}
    >
      {/* Desktop pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Desktop info (for debugging) */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs font-mono">
        PrometheOS Module Federation • Theme: {theme}
      </div>
    </div>
  );
};