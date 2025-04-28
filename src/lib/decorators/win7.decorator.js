import { toast } from "sonner";

export async function preload(previousTheme) {
  // Remove existing Windows theme CSS if present
  document.getElementById("win-theme-css")?.remove();

  const link = document.createElement("link");
  link.id = "win-theme-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/7.css@0.13.0/dist/7.css";

  return new Promise((resolve) => {
    link.onload = () => {
      toast("Windows 7 theme loaded", {
        description: "Theme changed successfully",
        position: "bottom-right",
      });
      resolve(true);
    };
    link.onerror = () => {
      toast.error("Failed to load Windows 7 theme", {
        description: "Please try again",
        position: "bottom-right",
      });
      resolve(false);
    };
    document.head.appendChild(link);
  });
}

export function postload() {
  // Add scrollbar fixes for Windows 7
  document.getElementById("scrollbar-fixes")?.remove();

  const style = document.createElement("style");
  style.id = "scrollbar-fixes";
  const gutter = "8px";

  style.textContent = `
    /* — existing scrollbar‐button & track fixes — */
    .has-scrollbar::-webkit-scrollbar-button:vertical:start:increment,
    .has-scrollbar::-webkit-scrollbar-button:vertical:end:decrement {
      display: none !important;
    }
    .has-scrollbar::-webkit-scrollbar-button:vertical:start:decrement,
    .has-scrollbar::-webkit-scrollbar-button:vertical:end:increment {
      width: 16px !important;
      height: 16px !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
    }
    .has-scrollbar::-webkit-scrollbar {
      width: 16px !important;
      height: 16px !important;
    }
    .has-scrollbar::-webkit-scrollbar-corner {
      background-color: transparent !important;
    }
    .has-scrollbar::-webkit-scrollbar-track {
      margin: 0 !important;
      background-clip: padding-box !important;
    }

    /* — adjust content‐window margins (no top gap, gutter on sides, keep bottom for win7) — */
    .window-body.has-scrollbar {
      margin-top: 0 !important;
      margin-left: ${gutter} !important;
      margin-right: ${gutter} !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  `;

  document.head.appendChild(style);
}

export function cleanup() {
  document.getElementById("win-theme-css")?.remove();
  document.getElementById("scrollbar-fixes")?.remove();
}
