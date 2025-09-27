import React, { useEffect, useState } from 'react';
// import './globals.css';

interface NotepadProps {
  windowId?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const Notepad: React.FC<NotepadProps> = (props) => {
  const {
    windowId = 'notepad',
    onClose,
    onMinimize,
    onMaximize
  } = props || {};

  const [Button, setButton] = useState<React.ComponentType<any> | null>(null);
  const [Textarea, setTextarea] = useState<React.ComponentType<any> | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        console.log('[Notepad] Loading shared UI kit...');
        const uiKit = await import('shared_ui_kit/ui-kit');
        console.log('[Notepad] UI kit loaded:', uiKit);
        if (active) {
          setButton(() => uiKit.Button);
          setTextarea(() => uiKit.Textarea);
        }
      } catch (error) {
        console.error('[Notepad] Failed to load UI kit:', error);
        if (active) {
          // Fallback components
          setButton(() => ({ children, ...props }: any) => (
            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" {...props}>
              {children}
            </button>
          ));
          setTextarea(() => ({ ...props }: any) => (
            <textarea className="w-full h-full border p-2 resize-none" {...props} />
          ));
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!Button || !Textarea) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading UI Kit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notepad-app h-full flex flex-col bg-background text-foreground border">
      <div className="p-2 flex justify-between items-center border-b bg-muted/50">
        <h1 className="text-sm font-semibold">Notepad - {windowId}</h1>
        <div className="flex gap-2">
          {onMinimize && (
            <Button variant="outline" size="sm" onClick={onMinimize} className="h-7 px-2">
              –
            </Button>
          )}
          {onMaximize && (
            <Button variant="outline" size="sm" onClick={onMaximize} className="h-7 px-2">
              □
            </Button>
          )}
          {onClose && (
            <Button variant="destructive" size="sm" onClick={onClose} className="h-7 px-2">
              ×
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 p-4">
        <Textarea
          apiId={`notepad-textarea-${windowId}`}
          className="w-full h-full resize-none"
          placeholder="Type your notes here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Notepad;
