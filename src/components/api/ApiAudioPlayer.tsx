import React, { useEffect, useRef } from "react";

import { registerApiActionHandler, useApi } from "@/api/context/ApiContext";
import { IActionResult, IApiAction } from "@/api/core/types";
import { withApi } from "@/api/hoc/withApi";

// Better approach: track active registrations rather than preventing all future registrations
const activeRegistrations = new Map<string, number>();

/**
 * Default API documentation for audio player
 */
export const audioPlayerApiDoc = {
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
    {
      id: "play",
      name: "Play",
      description: "Start playback of current track",
      available: true,
      parameters: [],
    } as IApiAction,
    {
      id: "pause",
      name: "Pause",
      description: "Pause playback of current track",
      available: true,
      parameters: [],
    } as IApiAction,
    {
      id: "next",
      name: "Next Track",
      description: "Skip to next track",
      available: true,
      parameters: [],
    } as IApiAction,
    {
      id: "previous",
      name: "Previous Track",
      description: "Skip to previous track",
      available: true,
      parameters: [],
    } as IApiAction,
    {
      id: "toggleMute",
      name: "Toggle Mute",
      description: "Mute or unmute audio",
      available: true,
      parameters: [],
    } as IApiAction,
    {
      id: "setVolume",
      name: "Set Volume",
      description: "Set the volume level",
      available: true,
      parameters: [
        {
          name: "volume",
          type: "number",
          description: "Volume level (0.0 to 1.0)",
          required: true,
        },
      ],
    } as IApiAction,
  ],
  path: "/apps/audioplayer/controls",
};

/**
 * Props for ApiAudioPlayerHandler component
 */
export interface ApiAudioPlayerHandlerProps {
  /** API ID for the audio player */
  apiId: string;
  /** API documentation for the audio player */
  api?: typeof audioPlayerApiDoc;
  /** Play function */
  onPlay: () => void;
  /** Pause function */
  onPause: () => void;
  /** Next track function */
  onNext: () => void;
  /** Previous track function */
  onPrevious: () => void;
  /** Toggle mute function */
  onToggleMute: () => void;
  /** Set volume function */
  onSetVolume: (volume: number) => void;
  /** Current playback state */
  isPlaying: boolean;
  /** Current track index */
  currentTrack: number;
  /** Current volume level */
  volume: number;
  /** Whether audio is muted */
  isMuted: boolean;
  /** Child components */
  children: React.ReactNode;
}

/**
 * Registers API handlers for audio player controls
 */
export const ApiAudioPlayerHandler: React.FC<ApiAudioPlayerHandlerProps> = ({
  apiId,
  api,
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
  children,
}) => {
  // Always register this instance for proper functioning
  const registeredRef = useRef(false);

  // Handle action registration
  useEffect(() => {
    // Track this specific component - we'll increment a reference count
    // rather than completely preventing registration
    let count = activeRegistrations.get(apiId) || 0;
    count++;
    activeRegistrations.set(apiId, count);

    // Always register on first mount of this instance
    if (!registeredRef.current) {
      console.log(
        `[API] Registering handlers for ${apiId} (instance ${count})`
      );
      registeredRef.current = true;

      // Only log the "already registered" message on subsequent instances
      if (count > 1) {
        console.log(
          `[API] Note: ${apiId} already has ${count - 1} active registration(s)`
        );
      }

      // Handler for play action
      const playHandler = async (): Promise<IActionResult> => {
        try {
          onPlay();
          return {
            success: true,
            data: { isPlaying: true },
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };

      // Handler for pause action
      const pauseHandler = async (): Promise<IActionResult> => {
        try {
          onPause();
          return {
            success: true,
            data: { isPlaying: false },
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };

      // Handler for next track action
      const nextHandler = async (): Promise<IActionResult> => {
        try {
          onNext();
          return {
            success: true,
            data: { message: "Skipped to next track" },
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };

      // Handler for previous track action
      const previousHandler = async (): Promise<IActionResult> => {
        try {
          onPrevious();
          return {
            success: true,
            data: { message: "Skipped to previous track" },
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };

      // Handler for toggle mute action
      const toggleMuteHandler = async (): Promise<IActionResult> => {
        try {
          onToggleMute();
          return {
            success: true,
            data: { isMuted: !isMuted },
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };

      // Handler for set volume action
      const setVolumeHandler = async (
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

          return {
            success: true,
            data: { volume: newVolume },
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };

      // Register all handlers
      registerApiActionHandler(apiId, "play", playHandler);
      registerApiActionHandler(apiId, "pause", pauseHandler);
      registerApiActionHandler(apiId, "next", nextHandler);
      registerApiActionHandler(apiId, "previous", previousHandler);
      registerApiActionHandler(apiId, "toggleMute", toggleMuteHandler);
      registerApiActionHandler(apiId, "setVolume", setVolumeHandler);
    }

    // Clean up on unmount
    return () => {
      // Decrement the reference count
      const count = activeRegistrations.get(apiId) || 0;
      if (count > 0) {
        activeRegistrations.set(apiId, count - 1);
      }

      registeredRef.current = false;
      console.log(
        `[API] Handlers for ${apiId} released (${
          count - 1
        } registrations remaining)`
      );
    };
  }, [
    apiId,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    onToggleMute,
    onSetVolume,
    isMuted,
  ]);

  // Create the api state based on current props
  const apiState = {
    enabled: true,
    visible: true,
    isPlaying,
    currentTrack,
    volume,
    isMuted,
  };

  // Wrap children with withApi HOC
  const ApiWrapper = withApi(
    ({ children }: { children: React.ReactNode }) => children,
    {
      ...audioPlayerApiDoc,
      ...(api || {}),
      state: apiState,
    }
  );

  return <ApiWrapper apiId={apiId}>{children}</ApiWrapper>;
};

// Create a memoized version to prevent unnecessary rerenders
export const MemoizedApiAudioPlayerHandler = React.memo(
  ApiAudioPlayerHandler,
  (prevProps, nextProps) => {
    // Only rerender when these props change
    return (
      prevProps.apiId === nextProps.apiId &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.currentTrack === nextProps.currentTrack &&
      prevProps.volume === nextProps.volume &&
      prevProps.isMuted === nextProps.isMuted
    );
  }
);
