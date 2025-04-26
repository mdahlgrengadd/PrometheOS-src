import React, { useEffect } from "react";

import { cn } from "@/lib/utils";
import { useWindowsTheme } from "@/providers/WindowsThemeProvider";

export interface RadioOption {
  id: string;
  label: string;
  value: string;
}

export interface WindowsRadioGroupProps {
  options: RadioOption[];
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Optional title rendered as a legend within the fieldset */
  legend?: string;
  /** Whether to wrap the options in a fieldset (groupbox). Set to false to render plain container. */
  fieldset?: boolean;
}

export function WindowsRadioGroup({
  options,
  name,
  value,
  onChange,
  className,
  legend,
  fieldset = true,
}: WindowsRadioGroupProps) {
  const { theme } = useWindowsTheme();
  const isWin98 = theme === "win98";

  // Inject the Win98 fieldset styling
  useEffect(() => {
    if (!isWin98) return;

    // Create unique ID for this style to avoid conflicts
    const styleId = "win98-fieldset-style";

    // Only add if it doesn't exist already
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;

      // The SVG converted to base64
      const svgBase64 =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNSIgaGVpZ2h0PSI1IiB2aWV3Qm94PSIwIDAgNSA1IiBmaWxsPSJncmV5IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTAgMEg1VjVIMFYySDJWM0gzVjJIMCIgZmlsbD0id2hpdGUiIC8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAwSDRWNEgwVjFIMVYzSDNWMUgwIiBmaWxsPSIjODA4MDgwIiAvPgo8L3N2Zz4=";

      style.textContent = `
        .win98-fieldset {
          border-image: url("${svgBase64}") 2;
          padding: calc(2 * var(--border-width, 1px) + var(--element-spacing, 8px));
          padding-block-start: var(--element-spacing, 8px);
          margin: 0;
          border-width: 2px;
          border-style: solid;
          border-color: transparent;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // No cleanup needed as we want the style to persist
    };
  }, [isWin98]);

  // Apply different classes based on theme
  const outer = isWin98
    ? cn("mb-4", className)
    : cn("mb-4 space-y-2", className);

  if (fieldset) {
    return (
      <fieldset className={isWin98 ? cn("win98-fieldset", className) : outer}>
        {legend && <legend>{legend}</legend>}
        {options.map(({ id, label, value: val }) => (
          <div key={id} className="field-row">
            <input
              id={id}
              type="radio"
              name={name}
              value={val}
              checked={value === val}
              onChange={() => onChange(val)}
            />
            <label htmlFor={id}>{label}</label>
          </div>
        ))}
      </fieldset>
    );
  }

  // Non-fieldset version remains unchanged
  return (
    <div className={outer}>
      {options.map(({ id, label, value: val }) => (
        <div key={id} className="field-row">
          <input
            id={id}
            type="radio"
            name={name}
            value={val}
            checked={value === val}
            onChange={() => onChange(val)}
          />
          <label htmlFor={id}>{label}</label>
        </div>
      ))}
    </div>
  );
}
