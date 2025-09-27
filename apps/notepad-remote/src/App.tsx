import React, { useState, useCallback } from 'react';

// Mock shared components until federation is fully set up
const WindowChrome: React.FC<any> = ({ title, children, ...props }) => (
  <div className="window-chrome border-b p-2 bg-gray-100">
    <div className="flex items-center justify-between">
      <span className="font-semibold">{title}</span>
      <div className="flex gap-1">
        <button className="px-2 py-1 text-xs bg-yellow-500 rounded">-</button>
        <button className="px-2 py-1 text-xs bg-green-500 rounded">□</button>
        <button className="px-2 py-1 text-xs bg-red-500 rounded">×</button>
      </div>
    </div>
  </div>
);

const Button: React.FC<any> = ({ children, className = '', ...props }) => (
  <button className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`} {...props}>
    {children}
  </button>
);

const Input: React.FC<any> = ({ className = '', ...props }) => (
  <input className={`px-2 py-1 border rounded ${className}`} {...props} />
);

// Mock API client
const useApiClient = () => ({
  executeAction: async (component: string, action: string, params: any) => {
    console.log(`[MockAPI] ${component}.${action}`, params);
    return { success: true, data: null };
  }
});

interface NotepadAppProps {
  windowId?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const NotepadApp: React.FC<NotepadAppProps> = ({
  windowId,
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [content, setContent] = useState<string>('');
  const [filename, setFilename] = useState<string>('Untitled.txt');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const apiClient = useApiClient();

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await apiClient.executeAction('notepad', 'save', {
        filename,
        content,
        windowId,
      });
      setIsDirty(false);
      console.log('[Notepad] File saved successfully');
    } catch (error) {
      console.error('[Notepad] Save failed:', error);
    }
  }, [apiClient, filename, content, windowId]);

  const handleOpen = useCallback(async () => {
    try {
      const result = await apiClient.executeAction('notepad', 'open', { windowId });
      if (result.success && result.data) {
        setContent((result.data as any).content || '');
        setFilename((result.data as any).filename || 'Untitled.txt');
        setIsDirty(false);
        console.log('[Notepad] File opened successfully');
      }
    } catch (error) {
      console.error('[Notepad] Open failed:', error);
    }
  }, [apiClient, windowId]);

  const handleNew = useCallback(() => {
    setContent('');
    setFilename('Untitled.txt');
    setIsDirty(false);
  }, []);

  const title = `${filename}${isDirty ? ' *' : ''} - Notepad`;

  return (
    <div className="notepad-app h-full flex flex-col bg-background">
      <WindowChrome
        title={title}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        icon="📝"
      />

      {/* Toolbar */}
      <div className="notepad-toolbar flex items-center gap-2 p-2 border-b bg-muted/50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNew}
          className="text-xs"
        >
          New
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="text-xs"
        >
          Open
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="text-xs"
          disabled={!isDirty}
        >
          Save
        </Button>
        <div className="flex-1" />
        <Input
          value={filename}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
          className="w-48 h-6 text-xs"
          placeholder="Filename"
        />
      </div>

      {/* Editor */}
      <div className="notepad-editor flex-1 relative">
        <textarea
          value={content}
          onChange={handleContentChange}
          className="absolute inset-0 w-full h-full p-4 border-0 outline-0 resize-none font-mono text-sm bg-background text-foreground"
          placeholder="Start typing..."
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="notepad-status-bar flex items-center justify-between px-4 py-1 text-xs bg-muted/30 border-t text-muted-foreground">
        <span>
          Lines: {content.split('\n').length} | Characters: {content.length}
        </span>
        <span>
          {isDirty ? 'Modified' : 'Saved'}
        </span>
      </div>
    </div>
  );
};

export default NotepadApp;