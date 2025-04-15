import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@splicemood/react-music-player';

export interface Track {
  id: number;
  title: string;
  author: string;
  src: string;
  cover?: string;
}

interface MusicPlayerProps {
  tracks?: Track[];
}

export const MusicPlayer = ({ tracks = [] }: MusicPlayerProps) => {
  const [playlist, setPlaylist] = useState<Track[]>(tracks);
  const audio = useAudio();
  const {
    currentTrackIndex,
    setCurrentTrack,
    isPlaying,
    togglePlayPause,
    play,
    nextTrack,
    prevTrack,
    duration,
    currentTime,
    setVolume,
    volume,
  } = audio;

  useEffect(() => {
    // If no tracks were provided, use a default sample track
    if (tracks.length === 0) {
      const sampleTrack = {
        id: 1,
        title: "Sample Audio",
        author: "Demo Artist",
        src: "/audio/sample.mp3",
        cover:
          "/icons/34691_beos_audio_loud_music_server_speaker_audio_beos_loud_music_server_speaker.png",
      };
      setPlaylist([sampleTrack]);
      audio.replacePlaylist([sampleTrack]);
    } else {
      setPlaylist(tracks);
      audio.replacePlaylist(tracks);
    }
  }, [tracks]);

  // Format time to display as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Get current track info
  const currentTrack = playlist[currentTrackIndex] || {
    title: "No track",
    author: "Unknown",
  };

  return (
    <div className="music-player flex flex-col gap-4 p-4">
      {/* Track info */}
      <div className="flex items-center justify-center gap-4">
        {currentTrack.cover && (
          <div
            className="album-cover w-20 h-20 rounded bg-cover bg-center"
            style={{ backgroundImage: `url(${currentTrack.cover})` }}
          />
        )}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold">{currentTrack.title}</h3>
          <p className="text-sm text-muted-foreground">{currentTrack.author}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Slider value={[progress]} max={100} step={1} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevTrack}
          disabled={playlist.length <= 1}
          className="rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
            <line x1="5" y1="19" x2="5" y2="5"></line>
          </svg>
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={togglePlayPause}
          className="rounded-full"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextTrack}
          disabled={playlist.length <= 1}
          className="rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19"></line>
          </svg>
        </Button>
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Volume</span>
        <Slider
          value={[volume * 100]}
          max={100}
          min={0}
          step={1}
          className="w-24"
          onValueChange={(values) => setVolume(values[0] / 100)}
        />
      </div>
    </div>
  );
};
