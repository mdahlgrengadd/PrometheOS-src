import React from 'react';
interface WindowContainerProps {
    children: React.ReactNode;
    className?: string;
    isMaximized?: boolean;
    position?: {
        x: number;
        y: number;
    };
    size?: {
        width: number;
        height: number;
    };
}
export declare const WindowContainer: React.FC<WindowContainerProps>;
export {};
