// Main builder components and utilities
export { default as IdeLayout } from "./layout/IdeLayout";
export { default as useIdeStore } from "./store/ide-store";
// Styles
import './index.css';
import './styles.css';

// Main plugin export
import BuilderPlugin from './ui';

export default BuilderPlugin;

// Components
export { default as ActivityBar } from "./components/ActivityBar";
export { default as CommandPalette } from "./components/CommandPalette";
export { default as EditorArea } from "./components/EditorArea";
export { default as PreviewPanel } from "./components/PreviewPanel";
export { default as SideBar } from "./components/SideBar";
export { default as StatusBar } from "./components/StatusBar";

// Types
export * from "./types";

// Utilities
export * from "./utils/esbuild-service";
export * from "./vfs/virtual-fs";
export { cn } from "./lib/utils";
