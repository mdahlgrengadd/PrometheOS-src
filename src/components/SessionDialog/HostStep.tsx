import React from "react";

import { generateHandshakeUrl } from "../../utils/sessionUtils";
import {
  Alert,
  CodeBlock,
  DisplayMode,
  LoadingPlaceholder,
  ModeToggle,
  QrBlock,
} from "./common";

export interface HostStepProps {
  localOffer?: string;
  shortCode: string;
  pinCode: string;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  connectionData: string;
  setConnectionData: (text: string) => void;
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
  connectionData,
  setConnectionData,
  handleAcceptAnswer,
  copyToClipboard,
  onBack,
}: HostStepProps) {
  return (
    <div className="space-y-4">
      {/* Display Method Toggle */}
      {localOffer && (
        <ModeToggle
          options={["qr", "text", "pin"] as const}
          current={displayMode}
          onChange={setDisplayMode}
        />
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

        <Alert type="warning">
          Testing Note: For proper connection, use two separate browser
          tabs/windows or different devices. Both offer and answer must
          exchange.
        </Alert>

        {localOffer ? (
          <>
            {displayMode === "pin" && (
              <CodeBlock
                value={pinCode}
                onCopy={copyToClipboard}
                isPinCode={true}
              />
            )}

            {displayMode === "qr" && (
              <QrBlock
                value={generateHandshakeUrl(shortCode, "join")}
                linkHref={generateHandshakeUrl(shortCode, "join")}
              />
            )}

            {displayMode === "text" && (
              <CodeBlock value={shortCode} onCopy={copyToClipboard} />
            )}
          </>
        ) : (
          <LoadingPlaceholder message="Creating connection offer..." />
        )}
      </div>

      {localOffer && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Step 2: Paste peer's response here:
          </p>
          <textarea
            rows={5}
            className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono resize-none"
            value={connectionData}
            onChange={(e) => setConnectionData(e.target.value)}
            placeholder="Paste the response code here…"
          />
        </>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          onClick={onBack}
        >
          Back
        </button>
        {localOffer && (
          <button
            type="button"
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-300"
            disabled={!connectionData}
            onClick={handleAcceptAnswer}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
