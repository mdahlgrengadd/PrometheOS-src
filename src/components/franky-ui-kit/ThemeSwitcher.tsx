import React from "react";

import { useTheme } from "@/lib/ThemeProvider";

import { WindowsButton } from "./Button";

export function WindowsThemeSwitcher() {
  const { theme, loadTheme } = useTheme();

  return (
    <div className="mt-4 flex flex-col space-y-2">
      <label>Select Windows Theme:</label>
      <select
        className="select mb-2"
        value={theme}
        onChange={(e) => loadTheme(e.target.value)}
      >
        <option value="win98">Windows 98</option>
        <option value="winxp">Windows XP</option>
        <option value="win7">Windows 7</option>
      </select>

      <div className="flex gap-2 flex-wrap">
        <WindowsButton onClick={() => loadTheme("win98")}>
          Switch to Win 98
        </WindowsButton>
        <WindowsButton onClick={() => loadTheme("winxp")}>
          Switch to Win XP
        </WindowsButton>
        <WindowsButton onClick={() => loadTheme("win7")}>
          Switch to Win 7
        </WindowsButton>
      </div>
    </div>
  );
}
