import React from 'react';

interface WindowContentProps {
  children: React.ReactNode;
}

export const WindowContent: React.FC<WindowContentProps> = ({ children }) => {
  return <div className="window-content">{children}</div>;
};
