// Main plugin export
import BuilderPlugin from './ui';
export default BuilderPlugin;

// Component exports for direct use
export { default as IdeLayout } from './layout/IdeLayout';
export { default as useIdeStore } from './store/ide-store';
export { default as ActivityBar } from './components/ActivityBar';
export { default as SideBar } from './components/SideBar';
export { default as EditorArea } from './components/EditorArea';
export { default as StatusBar } from './components/StatusBar';
export { default as CommandPalette } from './components/CommandPalette';
export { default as PreviewPanel } from './components/PreviewPanel';

// Type exports
export * from './types';

// Utility exports
export * from './utils/esbuild-service';
export { commands, mockFileSystem } from './utils/mock-data';
export { cn } from './lib/utils';
