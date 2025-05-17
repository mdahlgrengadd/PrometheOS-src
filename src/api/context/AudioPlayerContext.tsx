import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useApiComponent } from "@/api/hoc/withApi";
import { audioPlayerApiDoc } from "@/plugins/apps/audioplayer/manifest";
import { IActionResult } from "../core/types";
import { registerApiActionHandler } from "./ApiContext";

/**
 * Default API documentation for audio player
 */
const defaultAudioPlayerApiDoc = {
  type: "AudioPlayer",
  description: "An audio player component with playback controls",
  state: {
    enabled: true,
    visible: true,
    isPlaying: false,
    currentTrack: 0,
    volume: 1.0,
    isMuted: false,
  },
  actions: [
    { id: "play", name: "Play", description: "Start playback of current track", available: true, parameters: [] },
    { id: "pause", name: "Pause", description: "Pause playback of current track", available: true, parameters: [] },
    { id: "next", name: "Next Track", description: "Skip to next track", available: true, parameters: [] },
    { id: "previous", name: "Previous Track", description: "Skip to previous track", available: true, parameters: [] },
    { id: "toggleMute", name: "Toggle Mute", description: "Mute or unmute audio", available: true, parameters: [] },
    { id: "setVolume", name: "Set Volume", description: "Set the volume level", available: true, parameters: [{ name: "volume", type: "number", description: "Volume level (0.0 to 1.0)", required: true }] },
  ],
  path: "/apps/audioplayer/controls",
};

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
  // Create a static version of the API doc (without dynamic state)
  const staticApiDoc = useMemo(() => {
    const { state, ...staticDoc } = audioPlayerApiDoc;
    return staticDoc;
  }, []);

  // Get the state update function from the useApiComponent hook
  // Pass only the static API doc for registration
  const { updateState } = useApiComponent(apiId, staticApiDoc);

  /** Register action handlers */
  const { onPlay, onPause, onNext, onPrevious, onToggleMute, onSetVolume } =
    stateAndActions;
  const handlersRegisteredRef = useRef(false);

  // Memoize action handlers to maintain stable references
  const handlers = useMemo(
    () => ({
      play: async (): Promise<IActionResult> => {
        try {
          onPlay();
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      },
      pause: async (): Promise<IActionResult> => {
        try {
          onPause();
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      },
      next: async (): Promise<IActionResult> => {
        try {
          onNext();
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      },
      previous: async (): Promise<IActionResult> => {
        try {
          onPrevious();
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      },
      toggleMute: async (): Promise<IActionResult> => {
        try {
          onToggleMute();
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      },
      setVolume: async (
        params?: Record<string, unknown>
      ): Promise<IActionResult> => {
        try {
          if (!params || typeof params.volume !== "number") {
            return {
              success: false,
              error: "setVolume requires a 'volume' parameter of type number",
            };
          }

          const newVolume = Math.max(0, Math.min(1, params.volume as number));
          onSetVolume(newVolume);

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      },
    }),
    [onPlay, onPause, onNext, onPrevious, onToggleMute, onSetVolume]
  );

  // Register handlers only once with stable references
  useEffect(() => {
    if (!handlersRegisteredRef.current) {
      handlersRegisteredRef.current = true;
      console.log(`[AudioPlayer] Registering action handlers for ${apiId}`);

      registerApiActionHandler(apiId, "play", handlers.play);
      registerApiActionHandler(apiId, "pause", handlers.pause);
      registerApiActionHandler(apiId, "next", handlers.next);
      registerApiActionHandler(apiId, "previous", handlers.previous);
      registerApiActionHandler(apiId, "toggleMute", handlers.toggleMute);
      registerApiActionHandler(apiId, "setVolume", handlers.setVolume);
    }

    return () => {
      handlersRegisteredRef.current = false;
      // Action handlers are cleaned up automatically when component is unregistered
    };
  }, []); // Empty deps - only runs on mount/unmount

  /** Push state changes via updateState */
  const { isPlaying, currentTrack, volume, isMuted } = stateAndActions;
  const prevStateRef = useRef({ isPlaying, currentTrack, volume, isMuted });

  useEffect(() => {
    const prevState = prevStateRef.current;

    // Only update if state has actually changed
    if (
      prevState.isPlaying !== isPlaying ||
      prevState.currentTrack !== currentTrack ||
      prevState.volume !== volume ||
      prevState.isMuted !== isMuted
    ) {
      updateState({ isPlaying, currentTrack, volume, isMuted });
      prevStateRef.current = { isPlaying, currentTrack, volume, isMuted };
    }
  }, [isPlaying, currentTrack, volume, isMuted, updateState]);

  /** Memoize the context value so its identity stays stable */
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
