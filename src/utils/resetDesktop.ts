import { STORAGE_KEY as DYN_KEY } from '@/plugins/dynamicRegistry';
import { useWindowStore } from '@/store/windowStore';

/**
 * Resets the desktop to a clean initial state by clearing all state:
 * 1. Removes localStorage keys related to desktop state
 * 2. Clears URL query parameters
 * 3. Resets the in-memory Zustand window store
 * 4. Optionally reloads the page to reinitialize all contexts
 */
export function resetDesktopState(reload = false) {
  // 1) Clear localStorage keys
  localStorage.removeItem("desktop-window-state");
  localStorage.removeItem(DYN_KEY);
  localStorage.removeItem("show-desktop-icons");
  localStorage.removeItem("taskbar-autohide");
  localStorage.removeItem("enable-animations");
  localStorage.removeItem("selected-theme");
  localStorage.removeItem("window-padding");
  localStorage.removeItem("background-color");
  localStorage.removeItem("primary-color");
  localStorage.removeItem("wallpaper");

  // 2) Reset URL (drop all query params)
  window.history.replaceState({}, document.title, window.location.pathname);

  // 3) Reset the in-memory Zustand store
  useWindowStore.getState().reset();

  // 4) Optional hard reload to re-run PluginContext, AppOpener, etc.
  if (reload) {
    window.location.reload();
  }
}
