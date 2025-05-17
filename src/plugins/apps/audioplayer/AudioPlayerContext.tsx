import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useApiComponent } from "@/api/hoc/withApi";
import { audioPlayerApiDoc } from "./manifest";
import { IActionResult } from "../../../api/core/types";
import { registerApiActionHandler } from "@/api/context/ApiContext";

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
export const useAudioPlayer = () => useContext(Ctx)!;

export const AudioPlayerProvider: React.FC<
  AudioPlayerCtx & { apiId: string; children: React.ReactNode }
> = ({ apiId, children, onPlay, onPause, onNext, onPrevious, onToggleMute, onSetVolume, isPlaying, currentTrack, volume, isMuted }) => {
  const staticApiDoc = useMemo(() => {
    const { state, ...doc } = audioPlayerApiDoc;
    return doc;
  }, []);
  const { updateState } = useApiComponent(apiId, staticApiDoc);

  // Register handlers once
  const handlersRef = useRef(false);
  useEffect(() => {
    if (!handlersRef.current) {
      handlersRef.current = true;
      registerApiActionHandler(apiId, "play", async () => { onPlay(); return { success: true }; });
      registerApiActionHandler(apiId, "pause", async () => { onPause(); return { success: true }; });
      registerApiActionHandler(apiId, "next", async () => { onNext(); return { success: true }; });
      registerApiActionHandler(apiId, "previous", async () => { onPrevious(); return { success: true }; });
      registerApiActionHandler(apiId, "toggleMute", async () => { onToggleMute(); return { success: true }; });
      registerApiActionHandler(apiId, "setVolume", async (params?: Record<string, unknown>) => {
        if (!params || typeof params.volume !== "number") return { success: false, error: "setVolume requires 'volume'" };
        onSetVolume(Math.max(0, Math.min(1, params.volume as number)));
        return { success: true };
      });
    }
  }, [apiId, onPlay, onPause, onNext, onPrevious, onToggleMute, onSetVolume]);

  // Push state
  useEffect(() => {
    updateState({ isPlaying, currentTrack, volume, isMuted });
  }, [isPlaying, currentTrack, volume, isMuted]);

  return <Ctx.Provider value={{ isPlaying, currentTrack, volume, isMuted, onPlay, onPause, onNext, onPrevious, onToggleMute, onSetVolume }}>{children}</Ctx.Provider>;
};
