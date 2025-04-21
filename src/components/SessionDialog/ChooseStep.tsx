import React from "react";

export interface ChooseStepProps {
  onHost: () => void;
  onJoin: () => void;
}

export function ChooseStep({ onHost, onJoin }: ChooseStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Choose whether you want to host a session or join an existing one.
      </p>
      <div className="flex gap-4">
        <button
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          onClick={onHost}
        >
          Host a Session
        </button>
        <button
          className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          onClick={onJoin}
        >
          Join a Session
        </button>
      </div>
    </div>
  );
}
