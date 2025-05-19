import React, { useEffect, useState } from "react";

import { workerPluginManager } from "../../WorkerPluginManagerClient";
import { manifest } from "./manifest";

const WebllmChatContent: React.FC = () => {
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWebllm = async () => {
      try {
        const isRegistered = await workerPluginManager.isPluginRegistered(
          manifest.id
        );
        if (!isRegistered) {
          let workerPath = undefined;
          if (manifest.workerEntrypoint) {
            workerPath = import.meta.env.PROD
              ? `/worker/${manifest.workerEntrypoint}`
              : `/worker/${manifest.workerEntrypoint}`;
          } else {
            setError("No workerEntrypoint defined in manifest");
            return;
          }
          if (workerPath) {
            const success = await workerPluginManager.registerPlugin(
              manifest.id,
              workerPath
            );
            if (success) {
              setIsWorkerReady(true);
            } else {
              setError("Failed to register WebLLM worker");
            }
          }
        } else {
          setIsWorkerReady(true);
        }
      } catch (e) {
        setError(
          "Error initializing WebLLM worker: " +
            (e instanceof Error ? e.message : String(e))
        );
      }
    };
    initWebllm();
    // No cleanup for now
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebLLM Chat</h2>
      {!isWorkerReady && !error && (
        <div className="text-xs text-amber-500 mb-2">
          Initializing worker...
        </div>
      )}
      {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
      {isWorkerReady && !error && <p>Your plugin content goes here.</p>}
    </div>
  );
};

export default WebllmChatContent;
