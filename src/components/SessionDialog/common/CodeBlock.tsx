import React from "react";

export interface CodeBlockProps {
  value: string;
  onCopy: (text: string) => void;
  isPinCode?: boolean;
}

export function CodeBlock({
  value,
  onCopy,
  isPinCode = false,
}: CodeBlockProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-md">
      {isPinCode ? (
        <div className="font-mono text-4xl text-center tracking-widest my-4 user-select-all">
          {value}
        </div>
      ) : (
        <div className="border border-gray-300 rounded p-3 bg-white">
          <div className="font-mono text-xs overflow-x-auto max-h-40 overflow-y-auto break-all user-select-all">
            {value}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => onCopy(value)}
        className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm"
      >
        {isPinCode ? "Copy PIN" : "Copy to Clipboard"}
      </button>
      {isPinCode && (
        <p className="text-sm text-gray-600 mt-2">
          This PIN is tied to your connection data.
        </p>
      )}
    </div>
  );
}
