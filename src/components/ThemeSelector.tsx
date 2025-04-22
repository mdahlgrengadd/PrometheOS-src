import React, { useState } from "react";

import { ThemeType } from "@/lib/theme-types";
import { useTheme } from "@/lib/ThemeProvider";

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, themes, loadTheme, availableExternalThemes } =
    useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleThemeChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedTheme = event.target.value;
    setError(null);

    // If theme is already loaded, just set it
    if (themes[selectedTheme as ThemeType]) {
      setTheme(selectedTheme as ThemeType);
      return;
    }

    // Otherwise, try to load it
    if (availableExternalThemes.includes(selectedTheme)) {
      setLoading(true);
      try {
        const success = await loadTheme(selectedTheme);
        if (!success) {
          setError(`Failed to load theme: ${selectedTheme}`);
        }
      } catch (error) {
        setError("Error loading theme");
        console.error("Error loading theme:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="theme-selector p-2 flex flex-col gap-2 items-start bg-background/80 rounded shadow backdrop-blur"
      role="region"
      aria-label="Theme selection"
    >
      <label htmlFor="theme-select" className="text-sm" id="theme-select-label">
        Theme:
      </label>
      <div className="flex items-center gap-2">
        <select
          id="theme-select"
          value={theme}
          onChange={handleThemeChange}
          className="text-sm bg-background border border-border rounded px-2 py-1"
          disabled={loading}
          aria-labelledby="theme-select-label"
          aria-busy={loading}
          aria-describedby={error ? "theme-error" : undefined}
        >
          {/* Built-in themes */}
          <optgroup label="Built-in Themes">
            {Object.entries(themes).map(([themeId, themeConfig]) => (
              <option key={themeId} value={themeId}>
                {themeConfig.name}
              </option>
            ))}
          </optgroup>

          {/* Available external themes */}
          {availableExternalThemes.length > 0 && (
            <optgroup label="External Themes">
              {availableExternalThemes
                .filter((id) => !themes[id as ThemeType]) // Only show themes that aren't loaded
                .map((themeId) => (
                  <option key={themeId} value={themeId}>
                    {themeId} (Click to load)
                  </option>
                ))}
            </optgroup>
          )}
        </select>
        {loading && (
          <span className="text-xs animate-pulse" aria-live="polite">
            Loading...
          </span>
        )}
      </div>
      {error && (
        <p id="theme-error" className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default ThemeSelector;
