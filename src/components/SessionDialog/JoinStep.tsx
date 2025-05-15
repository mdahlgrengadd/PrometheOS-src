import React from "react";

export interface JoinStepProps {
  connectionData: string;
  setConnectionData: (text: string) => void;
  handleAcceptOffer: () => void;
  onBack: () => void;
}

export function JoinStep({
  connectionData,
  setConnectionData,
  handleAcceptOffer,
  onBack,
}: JoinStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-2">
        Enter host's connection code or PIN:
      </p>
      <textarea
        rows={5}
        className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono resize-none"
        value={connectionData}
        onChange={(e) => setConnectionData(e.target.value)}
        placeholder="Paste the connection code or enter 6‑digit PIN…"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-300"
          disabled={!connectionData}
          onClick={handleAcceptOffer}
        >
          Create Answer
        </button>
      </div>
    </div>
  );
}
