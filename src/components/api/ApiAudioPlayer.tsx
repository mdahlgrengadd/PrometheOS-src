import React from 'react';

import {
    AudioPlayerProvider as ContextProvider, useAudioPlayer as useAudioPlayerContext
} from '@/api/context/AudioPlayerContext';
import { IApiAction } from '@/api/core/types';

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
 * Props for ApiAudioPlayer component
 */
export interface ApiAudioPlayerProps {
  /** API ID for the audio player */
  apiId: string;
  /** API documentation for the audio player */
  api?: typeof audioPlayerApiDoc;
  /** Child components */
  children: React.ReactNode;
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
}

// Re-export the context provider and hook with aliases
// The AudioPlayerProvider automatically registers action handlers for all API actions
export const AudioPlayerProvider = ContextProvider;
export const useAudioPlayer = useAudioPlayerContext;

/**
 * ApiAudioPlayer component - uses AudioPlayerProvider to manage API registrations
 */
export const ApiAudioPlayer: React.FC<ApiAudioPlayerProps> = ({
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
}) => {
  // Use the AudioPlayerProvider from our context
  return (
    <AudioPlayerProvider
      apiId={apiId}
      onPlay={onPlay}
      onPause={onPause}
      onNext={onNext}
      onPrevious={onPrevious}
      onToggleMute={onToggleMute}
      onSetVolume={onSetVolume}
      isPlaying={isPlaying}
      currentTrack={currentTrack}
      volume={volume}
      isMuted={isMuted}
    >
      {children}
    </AudioPlayerProvider>
  );
};

// Also export a memoized version for backward compatibility
export const MemoizedApiAudioPlayerHandler = React.memo(
  ApiAudioPlayer,
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
