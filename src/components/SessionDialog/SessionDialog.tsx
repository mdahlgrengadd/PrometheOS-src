import React, { useEffect } from "react";

import { toast } from "../../hooks/use-toast";
import { useClipboard } from "../../hooks/useClipboard";
import { useSessionHandshake } from "../../hooks/useSessionHandshake";
import { AnswerStep } from "./AnswerStep";
import { ChooseStep } from "./ChooseStep";
import { Alert } from "./common";
import { DoneStep } from "./DoneStep";
import { HostStep } from "./HostStep";
import { JoinStep } from "./JoinStep";

export interface SessionDialogProps {
  onClose: () => void;
}

export function SessionDialog({ onClose }: SessionDialogProps) {
  const {
    step,
    setStep,
    localOffer,
    localAnswer,
    connected,
    messages,
    displayMode,
    setDisplayMode,
    connectionData,
    setConnectionData,
    shortCode,
    pinCode,
    handleAcceptOffer,
    handleAcceptAnswer,
    testMessage,
    setTestMessage,
    sendMessage,
    error,
  } = useSessionHandshake();

  const { copyToClipboard } = useClipboard();

  // Test toast on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      toast({ title: "Session Dialog Ready", description: "✔" });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 rounded-lg bg-white border shadow-lg w-[500px] max-w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Session Connection</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="Close dialog"
        >
          ✕
        </button>
      </div>
      {error && (
        <div className="mb-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {step === "choose" && (
        <ChooseStep
          onHost={() => setStep("host")}
          onJoin={() => setStep("join")}
        />
      )}
      {step === "host" && (
        <HostStep
          localOffer={localOffer}
          shortCode={shortCode}
          pinCode={pinCode}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          connectionData={connectionData}
          setConnectionData={setConnectionData}
          handleAcceptAnswer={handleAcceptAnswer}
          copyToClipboard={copyToClipboard}
          onBack={() => setStep("choose")}
        />
      )}
      {step === "join" && (
        <JoinStep
          connectionData={connectionData}
          setConnectionData={setConnectionData}
          handleAcceptOffer={handleAcceptOffer}
          onBack={() => setStep("choose")}
        />
      )}
      {step === "join:answer" && (
        <AnswerStep
          localAnswer={localAnswer}
          shortCode={shortCode}
          displayMode={displayMode === "pin" ? "text" : displayMode}
          setDisplayMode={(m) => setDisplayMode(m)}
          copyToClipboard={copyToClipboard}
          onContinue={() => setStep("done")}
        />
      )}
      {step === "done" && (
        <DoneStep
          connected={connected}
          messages={messages}
          testMessage={testMessage}
          setTestMessage={setTestMessage}
          sendMessage={sendMessage}
          onClose={onClose}
        />
      )}
    </div>
  );
}
