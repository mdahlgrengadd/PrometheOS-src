import type * as monacoType from "monaco-editor";

// Keep track of editor instances
const editorInstances: {
  [key: string]: monacoType.editor.IStandaloneCodeEditor;
} = {};

// Register a Monaco editor instance
export const registerEditor = (
  tabId: string,
  editor: monacoType.editor.IStandaloneCodeEditor
) => {
  editorInstances[tabId] = editor;
};

// Unregister a Monaco editor instance
export const unregisterEditor = (tabId: string) => {
  delete editorInstances[tabId];
};

// Get an editor instance by tab ID
export const getEditor = (tabId: string) => {
  return editorInstances[tabId];
};

// Get all editor instances
export const getAllEditors = () => {
  return editorInstances;
};
