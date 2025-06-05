// Main exports for the Desktop 3D module
export { default as Desktop3D } from "./components/Desktop3D";
export { default as AnimatedDesktopIcons } from "./components/AnimatedDesktopIcons";
export { default as Background3D } from "./components/Background3D";
export { default as DesktopIcon } from "./components/DesktopIcon";
export { default as LayoutControls } from "./components/LayoutControls";
export { default as SearchPopup } from "./components/SearchPopup";
export { default as Taskbar } from "./components/Taskbar";
export { default as TaskbarButton } from "./components/TaskbarButton";
export { default as Window3D } from "./components/Window3D";
export { getWindowContent } from "./components/WindowContents";

// Data exports
export * from "./data/iconData";
export * from "./data/periodicTableData";

// Store exports
export { useWindowStore } from "./stores/windowStore";

// Type exports
export * from "./types/Window";

// CSS imports (these will need to be imported in the consuming app)
export const styles = {
  index: () => import("./styles/index.css"),
  app: () => import("./styles/App.css"),
};
