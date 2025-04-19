import { List, Pause, Play, SkipBack, SkipForward, Volume, VolumeX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { AudioPlayerProvider, useAudioPlayer } from '@/components/api/ApiAudioPlayer';
import { ApiButtonWithHandler } from '@/components/api/ApiButton';

// Define WebkitAudioContext interface if it doesn't exist in TypeScript types
interface Window {
  webkitAudioContext: typeof AudioContext;
}

// Define sample songs - in a real app these would come from a database or files
const songs = [
  {
    title: "Vibe Machine",
    file: "/audio/sample1.mp3",
    howl: null,
  },
  {
    title: "Rave Digger",
    file: "/audio/sample2.mp3",
    howl: null,
  },
  // {
  //   title: "80s Vibe",
  //   file: "/audio/sample3.mp3",
  //   howl: null,
  // },
  // {
  //   title: "Running Out",
  //   file: "/audio/sample4.mp3",
  //   howl: null,
  // },
];

// Component that consumes the audio player context
const AudioPlayerUI = () => {
  // Get state and actions from context
  const {
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
  } = useAudioPlayer();

  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Track which listeners have been added to the audio element
  const listenersAddedRef = useRef<{
    timeupdate: boolean;
    loadedmetadata: boolean;
    ended: boolean;
  }>({
    timeupdate: false,
    loadedmetadata: false,
    ended: false,
  });

  const oscilloscopeRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Format time in mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update progress bar and time display - make it stable with useCallback
  const updateProgress = useCallback(() => {
    if (!audioElementRef.current) return;
    const el = audioElementRef.current;
    const currentTime = el.currentTime;
    const duration = el.duration || 0;
    setCurrentTime(formatTime(currentTime));
    setProgress((currentTime / duration) * 100);
  }, []);

  // Initialize audio element and visualization - now only handles track loading
  useEffect(() => {
    console.log("Audio reinitializing for track", currentTrack);

    // Create audio element
    const el = audioElementRef.current ?? document.createElement("audio");
    if (!audioElementRef.current) {
      el.crossOrigin = "anonymous";
      audioElementRef.current = el;
    }

    // Update the source
    el.src = songs[currentTrack].file;
    el.preload = "metadata";

    // Set up audio context if it doesn't exist
    if (!audioContextRef.current) {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaElementSource(el);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceRef.current = source;
    }

    // Create canvas for visualization if it doesn't exist
    if (oscilloscopeRef.current && !canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = oscilloscopeRef.current.clientWidth;
      // Set a fixed height for the canvas to prevent layout issues
      canvas.height = Math.min(150, oscilloscopeRef.current.clientHeight);
      canvas.style.width = "100%";
      oscilloscopeRef.current.appendChild(canvas);
      canvasRef.current = canvas;
    }

    // Set up event listeners
    if (!listenersAddedRef.current.timeupdate) {
      listenersAddedRef.current.timeupdate = true;
      el.addEventListener("timeupdate", updateProgress);
    }

    if (!listenersAddedRef.current.loadedmetadata) {
      listenersAddedRef.current.loadedmetadata = true;
      el.addEventListener("loadedmetadata", () => {
        setDuration(formatTime(el.duration));
      });
    }

    if (!listenersAddedRef.current.ended) {
      listenersAddedRef.current.ended = true;
      el.addEventListener("ended", onNext);
    }
  }, [currentTrack, onNext, updateProgress]);

  // Auto-play effect - plays the track when isPlaying is true or currentTrack changes
  useEffect(() => {
    const el = audioElementRef.current;
    if (!el) return;

    if (isPlaying) {
      // Resume AudioContext if it's suspended
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
      el.play().catch((e) => console.error("Error auto-playing track:", e));
    }
  }, [currentTrack, isPlaying]);

  // Sync effect - handles pause and volume adjustments only
  useEffect(() => {
    const el = audioElementRef.current;
    if (!el) return;

    if (!isPlaying && !el.paused) {
      el.pause();
    }

    // Update volume
    el.volume = isMuted ? 0 : volume;
  }, [isPlaying, volume, isMuted]);

  // Clean up on complete unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        const audioElement = audioElementRef.current;
        audioElement.pause();

        if (listenersAddedRef.current.timeupdate) {
          audioElement.removeEventListener("timeupdate", updateProgress);
          listenersAddedRef.current.timeupdate = false;
        }

        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }

        if (analyserRef.current) {
          analyserRef.current.disconnect();
        }

        if (audioContextRef.current) {
          audioContextRef.current.close();
        }

        audioElement.remove();
      }

      if (canvasRef.current && oscilloscopeRef.current) {
        oscilloscopeRef.current.removeChild(canvasRef.current);
      }
    };
  }, [updateProgress]);

  // Start visualization loop
  useEffect(() => {
    // Animation function for the oscilloscope
    const animate = () => {
      if (!analyserRef.current || !canvasRef.current) return;

      const analyser = analyserRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Get waveform data
      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvas.height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      requestRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  // Play/pause toggle
  const togglePlay = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  // Handle volume change from UI
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioElementRef.current) return;

    const newVolume = parseFloat(e.target.value);
    onSetVolume(newVolume);
  };

  // Seek to position
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElementRef.current) return;

    const progressBar = e.currentTarget;
    const percent = e.nativeEvent.offsetX / progressBar.clientWidth;
    const newTime = percent * audioElementRef.current.duration;

    audioElementRef.current.currentTime = newTime;
    setProgress(percent * 100);
  };

  // Toggle playlist visibility
  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  // Toggle volume slider visibility
  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  // Play specific track
  const playTrack = (index: number) => {
    if (!audioElementRef.current || index === currentTrack) return;

    // Need to update the track via the context
    // We can't directly set the track, so we need to move to it
    // Calculate how many positions we need to move
    const currentPosition = currentTrack;
    const targetPosition = index;
    const tracksCount = songs.length;

    // Find the shortest path (forward or backward)
    const forwardDistance =
      (targetPosition - currentPosition + tracksCount) % tracksCount;
    const backwardDistance =
      (currentPosition - targetPosition + tracksCount) % tracksCount;

    // Use the shortest path
    if (forwardDistance <= backwardDistance) {
      // Go forward
      for (let i = 0; i < forwardDistance; i++) {
        onNext();
      }
    } else {
      // Go backward
      for (let i = 0; i < backwardDistance; i++) {
        onPrevious();
      }
    }

    // Make sure playback starts
    onPlay();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-gradient-to-br from-purple-500 via-purple-400 to-indigo-600">
      {/* Title and Time */}
      <div className="absolute top-0 w-full p-2 z-10">
        <div id="title" className="text-center text-white font-light text-xl">
          {songs[currentTrack].title}
        </div>
        <div
          id="timer"
          className="absolute top-0 left-3 text-white text-lg opacity-90"
        >
          {currentTime}
        </div>
        <div
          id="duration"
          className="absolute top-0 right-3 text-white text-lg opacity-50"
        >
          {duration}
        </div>
      </div>

      {/* Oscilloscope/Waveform - Make it take less vertical space */}
      <div
        ref={oscilloscopeRef}
        className="w-full flex-1 flex items-start justify-center pt-4 min-h-0"
      ></div>

      {/* Progress Bar - Reduce bottom margin */}
      <div className="w-full px-4 relative mb-2">
        <div
          id="bar"
          className="w-full h-1 bg-white/30 cursor-pointer rounded-full overflow-hidden"
          onClick={seek}
        >
          <div
            id="progress"
            className="h-full bg-white/90 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Controls - Ensure they have enough space */}
      <div className="p-2 pb-3 flex items-center justify-between">
        <button
          className="text-white opacity-80 hover:opacity-100 transition-opacity"
          onClick={togglePlaylist}
        >
          <List size={22} />
        </button>

        <div className="flex items-center justify-center gap-4">
          <button
            className="text-white opacity-80 hover:opacity-100 transition-opacity"
            onClick={onPrevious}
          >
            <SkipBack size={26} />
          </button>

          <button
            className="text-white bg-white/20 w-10 h-10 rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} className="ml-1" />
            )}
          </button>

          <button
            className="text-white opacity-80 hover:opacity-100 transition-opacity"
            onClick={onNext}
          >
            <SkipForward size={26} />
          </button>
        </div>

        <button
          className="text-white opacity-80 hover:opacity-100 transition-opacity"
          onClick={toggleVolumeSlider}
        >
          {isMuted ? <VolumeX size={22} /> : <Volume size={22} />}
        </button>
      </div>

      {/* Playlist Overlay */}
      {showPlaylist && (
        <div className="absolute inset-0 bg-black/60 z-20 flex flex-col">
          <div className="flex-1 py-10 overflow-auto">
            {songs.map((song, index) => (
              <div
                key={index}
                className={`text-white text-lg py-3 px-6 cursor-pointer hover:bg-white/10 transition ${
                  index === currentTrack ? "font-bold" : "font-light"
                }`}
                onClick={() => playTrack(index)}
              >
                {song.title}
              </div>
            ))}
          </div>
          <button
            className="self-center mb-6 text-white py-2 px-6 rounded-full bg-white/20 hover:bg-white/30 transition"
            onClick={togglePlaylist}
          >
            Close
          </button>
        </div>
      )}

      {/* Volume Slider Overlay */}
      {showVolumeSlider && (
        <div className="absolute bottom-16 right-4 bg-black/60 p-3 rounded-lg z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-white opacity-80 hover:opacity-100"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-32 accent-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Main component that provides the audio player context
const AudioPlayerContent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Handler functions for the audio player
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentTrack((prev) => (prev + 1) % songs.length);
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentTrack((prev) => (prev - 1 + songs.length) % songs.length);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleSetVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  return (
    <>
      <AudioPlayerProvider
        apiId="audio-player-controls"
        onPlay={handlePlay}
        onPause={handlePause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onToggleMute={handleToggleMute}
        onSetVolume={handleSetVolume}
        isPlaying={isPlaying}
        currentTrack={currentTrack}
        volume={volume}
        isMuted={isMuted}
      >
        <AudioPlayerUI />
      </AudioPlayerProvider>

      <ApiButtonWithHandler
        apiId="audio-player-controls2"
        api={{
          type: "Button",
          description: "Play button for audio player",
          actions: [
            {
              id: "click",
              name: "Play Button Click",
              description: "Starts the audio playback",
              available: true,
              parameters: [],
            },
          ],
          path: "/apps/audioplayer/buttons/play",
          state: {
            enabled: true,
            visible: true,
          },
        }}
        onClick={handlePlay}
      >
        Play
      </ApiButtonWithHandler>
    </>
  );
};

export default React.memo(AudioPlayerContent);
