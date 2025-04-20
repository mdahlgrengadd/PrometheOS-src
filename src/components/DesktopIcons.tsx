import React, { useEffect, useRef, useState } from "react";

import { getAppLaunchUrl } from "@/utils/url";

interface IconWindow {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface DesktopIconsProps {
  windows: IconWindow[];
  openWindow: (id: string) => void;
}

const DesktopIcons: React.FC<DesktopIconsProps> = ({ windows, openWindow }) => {
  console.log("%c[DesktopIcons] Re-rendered", "color: orange");
  const [showIcons, setShowIcons] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    appId: string;
    visible: boolean;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if desktop icons should be visible
  useEffect(() => {
    const checkShowIconsSettings = () => {
      // Default to true if setting doesn't exist
      const shouldShowIcons =
        localStorage.getItem("show-desktop-icons") !== "false";
      setShowIcons(shouldShowIcons);
    };

    // Initial check
    checkShowIconsSettings();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "show-desktop-icons") {
        setShowIcons(e.newValue !== "false");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check the document's custom property for visibility changes
    const observeVisibilityProperty = () => {
      const visibilityValue = getComputedStyle(document.documentElement)
        .getPropertyValue("--desktop-icons-visibility")
        .trim();
      setShowIcons(visibilityValue !== "hidden");
    };

    // Create a MutationObserver to watch for style attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          observeVisibilityProperty();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      appId,
      visible: true,
    });
  };

  // Copy app launch URL
  const copyAppLaunchUrl = (appId: string) => {
    const url = getAppLaunchUrl(appId);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        // Show toast or notification if available
        console.log(`URL copied: ${url}`);
      })
      .catch((err) => {
        console.error("Could not copy URL: ", err);
      });
    setContextMenu(null);
  };

  // If icons should be hidden, don't render anything
  if (!showIcons) {
    return null;
  }

  return (
    <div className="desktop-icons">
      {windows.map((window) => {
        console.log(`Rendering icon for ${window.id}:`, window.icon);

        return (
          <div
            key={window.id}
            className="desktop-icon"
            onDoubleClick={() => openWindow(window.id)}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => handleContextMenu(e, window.id)}
          >
            {window.icon || (
              <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center text-white">
                {window.title.charAt(0)}
              </div>
            )}
            <div className="desktop-icon-label">{window.title}</div>
          </div>
        );
      })}

      {/* Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div
          ref={menuRef}
          className="absolute bg-white shadow-md rounded-md py-1 z-50"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => openWindow(contextMenu.appId)}
          >
            Open
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => copyAppLaunchUrl(contextMenu.appId)}
          >
            Copy Launch URL
          </div>
        </div>
      )}
    </div>
  );
};

function areEqual(prev: DesktopIconsProps, next: DesktopIconsProps): boolean {
  // Compare the openWindow callback
  if (prev.openWindow !== next.openWindow) return false;

  // Compare windows length
  if (prev.windows.length !== next.windows.length) return false;

  // Compare each window's properties
  for (let i = 0; i < prev.windows.length; i++) {
    const a = prev.windows[i];
    const b = next.windows[i];

    // Compare basic properties
    if (a.id !== b.id || a.title !== b.title) return false;

    // We don't compare the actual icon React elements deeply as that's expensive and unnecessary
    // Just check if both have an icon or both don't have an icon
    // This works because icons are loaded once and don't change during the app lifecycle
    if ((a.icon === undefined) !== (b.icon === undefined)) return false;
  }

  return true;
}

export default React.memo(DesktopIcons, areEqual);
