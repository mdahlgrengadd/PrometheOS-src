import React from 'react';
interface WindowChromeProps {
    title: string;
    isMaximized?: boolean;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
    className?: string;
    children?: React.ReactNode;
}
export declare const WindowChrome: React.FC<WindowChromeProps>;
export {};
