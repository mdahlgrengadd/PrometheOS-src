import React, { createContext, useEffect, useMemo, useRef } from "react";

import { registerApiActionHandler } from "@/api/context/ApiContext";
import { useApiComponent } from "@/api/hoc/withApi";

import { audioPlayerApiDoc } from "./manifest";

type AudioPlayerCtx = {
  isPlaying: boolean;
  currentTrack: number;
  volume: number;
  isMuted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleMute: () => void;
  onSetVolume: (v: number) => void;
};

const Ctx = createContext<AudioPlayerCtx | null>(null);

export const AudioPlayerProvider: React.FC<
  AudioPlayerCtx & {
    apiId: string;
    children: React.ReactNode;
    exposeApi?: boolean;
  }
> = ({
  apiId,
  children,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onToggleMute,
  onSetVolume,
  isPlaying,
  currentTrack,
  volume,
  isMuted,
  exposeApi = undefined, // default to true
}) => {
  const staticApiDoc = useMemo(() => {
    const { state, ...doc } = audioPlayerApiDoc;
    return doc;
  }, []);

  // Only register the API doc if exposeApi is true
  const dummyApiDoc = {
    type: "none",
    description: "",
    actions: [],
    path: "",
    state: { enabled: false, visible: false },
  };
  const { updateState: realUpdateState } = useApiComponent(
    exposeApi ? apiId : `hidden-${apiId}`,
    exposeApi ? staticApiDoc : dummyApiDoc
  );

  // Only register handlers if exposeApi is true
  const handlersRef = useRef(false);
  useEffect(() => {
    if (exposeApi && !handlersRef.current) {
      handlersRef.current = true;
      registerApiActionHandler(apiId, "play", async () => {
        onPlay();
        return { success: true };
      });
      registerApiActionHandler(apiId, "pause", async () => {
        onPause();
        return { success: true };
      });
      registerApiActionHandler(apiId, "next", async () => {
        onNext();
        return { success: true };
      });
      registerApiActionHandler(apiId, "previous", async () => {
        onPrevious();
        return { success: true };
      });
      registerApiActionHandler(apiId, "toggleMute", async () => {
        onToggleMute();
        return { success: true };
      });
      registerApiActionHandler(
        apiId,
        "setVolume",
        async (params?: Record<string, unknown>) => {
          if (!params || typeof params.volume !== "number")
            return { success: false, error: "setVolume requires 'volume'" };
          onSetVolume(Math.max(0, Math.min(1, params.volume as number)));
          return { success: true };
        }
      );
    }
  }, [
    exposeApi,
    apiId,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    onToggleMute,
    onSetVolume,
  ]);

  useEffect(() => {
    if (exposeApi) {
      realUpdateState({ isPlaying, currentTrack, volume, isMuted });
    }
  }, [exposeApi, isPlaying, currentTrack, volume, isMuted, realUpdateState]);

  return (
    <Ctx.Provider
      value={{
        isPlaying,
        currentTrack,
        volume,
        isMuted,
        onPlay,
        onPause,
        onNext,
        onPrevious,
        onToggleMute,
        onSetVolume,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export function useAudioPlayer() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider"
    );
  return ctx;
}
