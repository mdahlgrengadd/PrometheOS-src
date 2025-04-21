import React from "react";
import QRCode from "react-qr-code";

import { generateHandshakeUrl } from "../../utils/sessionUtils";

export interface AnswerStepProps {
  localAnswer?: string;
  shortCode: string;
  displayMode: "qr" | "text";
  setDisplayMode: (mode: "qr" | "text") => void;
  copyToClipboard: (text: string) => void;
  onContinue: () => void;
}

export function AnswerStep({
  localAnswer,
  shortCode,
  displayMode,
  setDisplayMode,
  copyToClipboard,
  onContinue,
}: AnswerStepProps) {
  return (
    <div className="space-y-4">
      {localAnswer && (
        <div className="flex justify-center gap-2">
          {(["qr", "text"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDisplayMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded ${
                displayMode === mode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {mode === "qr" ? "QR Code" : "Text Code"}
            </button>
          ))}
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Step 2:{" "}
          {displayMode === "qr"
            ? "Show this QR to host"
            : "Share this connection code with host"}
        </p>
        <div className="p-2 mb-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
          <strong>Important:</strong> The connection won’t complete until the
          host scans or enters this answer code.
        </div>

        {!localAnswer ? (
          <div className="h-64 w-64 mx-auto flex flex-col items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-3 text-sm text-gray-600">Creating answer…</p>
          </div>
        ) : displayMode === "qr" ? (
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
            <QRCode
              value={generateHandshakeUrl(shortCode, "answer")}
              size={300}
            />
            <p className="mt-3 text-sm text-gray-600">
              Scan with phone to open connection page
            </p>
            <a
              href={generateHandshakeUrl(shortCode, "answer")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs text-blue-500 underline"
            >
              Test link
            </a>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="border border-gray-300 rounded p-3 bg-white">
              <div className="font-mono text-xs overflow-x-auto max-h-40 overflow-y-auto break-all user-select-all">
                {shortCode}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(shortCode)}
              className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
