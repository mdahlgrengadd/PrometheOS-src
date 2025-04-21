import React from "react";

export type DisplayMode = "qr" | "text" | "pin";

export interface ModeToggleProps {
  options: readonly DisplayMode[];
  current: DisplayMode;
  onChange: (mode: DisplayMode) => void;
}

export function ModeToggle({ options, current, onChange }: ModeToggleProps) {
  return (
    <div className="flex justify-center gap-2">
      {options.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`px-3 py-1 text-xs font-medium rounded ${
            current === mode
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {mode === "qr"
            ? "QR Code"
            : mode === "text"
            ? "Text Code"
            : "PIN Code"}
        </button>
      ))}
    </div>
  );
}
