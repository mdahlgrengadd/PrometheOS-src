import React from "react";
import QRCode from "react-qr-code";

import { generateHandshakeUrl } from "../../utils/sessionUtils";

export interface HostStepProps {
  localOffer?: string;
  shortCode: string;
  pinCode: string;
  displayMode: "qr" | "text" | "pin";
  setDisplayMode: (mode: "qr" | "text" | "pin") => void;
  scannedText: string;
  setScannedText: (text: string) => void;
  handleAcceptAnswer: () => void;
  copyToClipboard: (text: string) => void;
  onBack: () => void;
}

export function HostStep({
  localOffer,
  shortCode,
  pinCode,
  displayMode,
  setDisplayMode,
  scannedText,
  setScannedText,
  handleAcceptAnswer,
  copyToClipboard,
  onBack,
}: HostStepProps) {
  return (
    <div className="space-y-4">
      {/* Display Method Toggle */}
      {localOffer && (
        <div className="flex justify-center gap-2">
          {(["qr", "text", "pin"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDisplayMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded ${
                displayMode === mode
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
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Step 1:{" "}
          {displayMode === "qr"
            ? "Have peer scan this QR code"
            : displayMode === "pin"
            ? "Share this PIN code with peer"
            : "Share this connection code with peer"}
        </p>

        <div className="p-2 mb-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
          <strong>Testing Note:</strong> For proper connection, use two separate
          browser tabs/windows or different devices. Both offer and answer must
          exchange.
        </div>

        {localOffer ? (
          <>
            {displayMode === "pin" && (
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="font-mono text-4xl text-center tracking-widest my-4 user-select-all">
                  {pinCode}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  This PIN is tied to your connection data.
                </p>
                <button
                  onClick={() => copyToClipboard(pinCode)}
                  className="mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Copy PIN
                </button>
              </div>
            )}

            {displayMode === "qr" && (
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
                <QRCode
                  value={generateHandshakeUrl(shortCode, "join")}
                  size={300}
                />
                <p className="mt-3 text-sm text-gray-600">
                  Scan with phone to open connection page
                </p>
                <a
                  href={generateHandshakeUrl(shortCode, "join")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-blue-500 underline"
                >
                  Test link
                </a>
              </div>
            )}

            {displayMode === "text" && (
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
          </>
        ) : (
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
            <p className="mt-3 text-sm text-gray-600">
              Creating connection offer...
            </p>
          </div>
        )}
      </div>

      {localOffer && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Step 2: Paste peer’s response here:
          </p>
          <textarea
            rows={5}
            className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono resize-none"
            value={scannedText}
            onChange={(e) => setScannedText(e.target.value)}
            placeholder="Paste the response code here…"
          />
        </>
      )}

      <div className="flex justify-end gap-2">
        <button
          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          onClick={onBack}
        >
          Back
        </button>
        {localOffer && (
          <button
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-300"
            disabled={!scannedText}
            onClick={handleAcceptAnswer}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
