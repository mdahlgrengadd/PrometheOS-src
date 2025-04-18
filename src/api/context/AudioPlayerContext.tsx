import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';

import { useApiComponent } from '@/api/hoc/withApi';
import { audioPlayerApiDoc } from '@/components/api/ApiAudioPlayer';

import { IActionResult } from '../core/types';
import { registerApiActionHandler } from './ApiContext';

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
  Omit<AudioPlayerCtx, ""> & { apiId: string; children: React.ReactNode }
> = ({ apiId, children, ...stateAndActions }) => {
  /** 1️⃣  Register ONCE (on mount) */
  const { updateState } = useApiComponent(apiId, {
    ...audioPlayerApiDoc,
    // initial snapshot
    state: {
      ...audioPlayerApiDoc.state,
      ...pickState(stateAndActions),
    },
  });

  /** Register action handlers */
  const { onPlay, onPause, onNext, onPrevious, onToggleMute, onSetVolume } =
    stateAndActions;
  const handlersRegisteredRef = useRef(false);

  useEffect(() => {
    // Register handlers only once
    if (!handlersRegisteredRef.current) {
      handlersRegisteredRef.current = true;
      console.log(`[AudioPlayer] Registering action handlers for ${apiId}`);

      // Handler for play action
      registerApiActionHandler(
        apiId,
        "play",
        async (): Promise<IActionResult> => {
          try {
            onPlay();
            return {
              success: true,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage };
          }
        }
      );

      // Handler for pause action
      registerApiActionHandler(
        apiId,
        "pause",
        async (): Promise<IActionResult> => {
          try {
            onPause();
            return {
              success: true,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage };
          }
        }
      );

      // Handler for next track action
      registerApiActionHandler(
        apiId,
        "next",
        async (): Promise<IActionResult> => {
          try {
            onNext();
            return {
              success: true,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage };
          }
        }
      );

      // Handler for previous track action
      registerApiActionHandler(
        apiId,
        "previous",
        async (): Promise<IActionResult> => {
          try {
            onPrevious();
            return {
              success: true,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage };
          }
        }
      );

      // Handler for toggle mute action
      registerApiActionHandler(
        apiId,
        "toggleMute",
        async (): Promise<IActionResult> => {
          try {
            onToggleMute();
            return {
              success: true,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage };
          }
        }
      );

      // Handler for set volume action
      registerApiActionHandler(
        apiId,
        "setVolume",
        async (params?: Record<string, unknown>): Promise<IActionResult> => {
          try {
            if (!params || typeof params.volume !== "number") {
              return {
                success: false,
                error: "setVolume requires a 'volume' parameter of type number",
              };
            }

            const newVolume = Math.max(0, Math.min(1, params.volume as number));
            onSetVolume(newVolume);

            return {
              success: true,
              // Don't return state data to avoid stale closures
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage };
          }
        }
      );
    }

    // No cleanup needed for action handlers as they're cleaned up when component is unregistered
  }, [apiId, onPlay, onPause, onNext, onPrevious, onToggleMute, onSetVolume]);

  /** 2️⃣  Push state changes only */
  const { isPlaying, currentTrack, volume, isMuted } = stateAndActions;
  useEffect(() => {
    updateState({ isPlaying, currentTrack, volume, isMuted });
  }, [isPlaying, currentTrack, volume, isMuted, updateState]);

  /** 3️⃣  Memo‑ise the context value so its identity stays stable */
  const ctxValue = useMemo(
    () => ({
      isPlaying,
      currentTrack,
      volume,
      isMuted,
      onPlay: stateAndActions.onPlay,
      onPause: stateAndActions.onPause,
      onNext: stateAndActions.onNext,
      onPrevious: stateAndActions.onPrevious,
      onToggleMute: stateAndActions.onToggleMute,
      onSetVolume: stateAndActions.onSetVolume,
    }),
    [
      isPlaying,
      currentTrack,
      volume,
      isMuted,
      stateAndActions.onPlay,
      stateAndActions.onPause,
      stateAndActions.onNext,
      stateAndActions.onPrevious,
      stateAndActions.onToggleMute,
      stateAndActions.onSetVolume,
    ]
  );

  return <Ctx.Provider value={ctxValue}>{children}</Ctx.Provider>;
};

function pickState(src: Partial<AudioPlayerCtx>) {
  const { isPlaying, currentTrack, volume, isMuted } = src;
  return { isPlaying, currentTrack, volume, isMuted };
}
