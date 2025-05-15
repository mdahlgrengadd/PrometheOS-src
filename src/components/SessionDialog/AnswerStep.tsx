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
        <ModeToggle
          options={["qr", "text"] as const}
          current={displayMode}
          onChange={setDisplayMode}
        />
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Step 2:{" "}
          {displayMode === "qr"
            ? "Show this QR to host"
            : "Share this connection code with host"}
        </p>
        <Alert type="warning">
          Important: The connection won't complete until the host scans or
          enters this answer code.
        </Alert>

        {!localAnswer ? (
          <LoadingPlaceholder message="Creating answer…" />
        ) : displayMode === "qr" ? (
          <QrBlock
            value={generateHandshakeUrl(shortCode, "answer")}
            linkHref={generateHandshakeUrl(shortCode, "answer")}
          />
        ) : (
          <CodeBlock value={shortCode} onCopy={copyToClipboard} />
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
