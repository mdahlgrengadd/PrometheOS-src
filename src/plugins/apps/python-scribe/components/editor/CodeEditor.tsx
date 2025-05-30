
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'python' | 'typescript' | 'json';
  readOnly?: boolean;
  placeholder?: string;
  fullscreen?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  readOnly = false,
  placeholder,
  fullscreen = false
}) => {
  const getLanguageExtension = () => {
    switch (language) {
      case 'python':
        return [python()];
      case 'typescript':
        return [javascript({ typescript: true })];
      case 'json':
        return [javascript()];
      default:
        return [];
    }
  };

  const containerClass = fullscreen 
    ? "fixed inset-0 z-50 bg-background overflow-auto"
    : "h-full overflow-auto";

  const editorHeight = fullscreen ? "100vh" : "100%";

  return (
    <div className={containerClass}>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={getLanguageExtension()}
        theme={oneDark}
        editable={!readOnly}
        placeholder={placeholder}
        height={editorHeight}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: false,
        }}
        style={{
          fontSize: '14px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        }}
      />
    </div>
  );
};

export default CodeEditor;
