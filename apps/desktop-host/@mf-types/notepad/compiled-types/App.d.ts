import React from 'react';
interface NotepadAppProps {
    windowId?: string;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
}
declare const NotepadApp: React.FC<NotepadAppProps>;
export default NotepadApp;
