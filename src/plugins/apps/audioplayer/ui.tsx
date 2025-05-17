import { Howl, Howler } from "howler";
import {
  List,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume,
  VolumeX,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/api/button";

import { AudioPlayerProvider, useAudioPlayer } from "./AudioPlayerContext";

// Define sample songs - in a real app these would come from a database or files
const songs = [
  {
    title: "Vibe Machine",
    file: "/audio/sample1.mp3",
  },
  {
    title: "Rave Digger",
    file: "/audio/sample2.mp3",
  },
  // {
  //   title: "80s Vibe",
  //   file: "/audio/sample3.mp3",
  // },
  // {
  //   title: "Running Out",
  //   file: "/audio/sample4.mp3",
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

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [hasKicked, setHasKicked] = useState(false);

  const howlRef = useRef<Howl | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const oscilloscopeRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundIdRef = useRef<number | null>(null);

  // Format time in mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Function to kick iOS media channel
  const kickMediaChannel = () => {
    const s = new Audio("/audio/silence.mp3");
    s.volume = 0;
    s.loop = true; // Keep it playing forever
    s.play(); // Must be in the user's tap handler
    // Store it so it isn't garbage collected
    silentAudioRef.current = s;
  };

  // (Re)create Howl whenever currentTrack changes
  useEffect(() => {
    // Clean up previous
    if (howlRef.current) {
      howlRef.current.unload();
    }

    const howl = new Howl({
      src: [songs[currentTrack].file],
      volume: isMuted ? 0 : volume,
      onload: () => {
        setDuration(howl.duration());

        // Set up analyser node after Howler has created its graph
        if (Howler.ctx && !analyserRef.current) {
          const analyser = Howler.ctx.createAnalyser();
          analyser.fftSize = 256;

          // Re-wire the masterGain through your analyser
          Howler.masterGain.disconnect();
          Howler.masterGain.connect(analyser);
          analyser.connect(Howler.ctx.destination);
          analyserRef.current = analyser;

          // Create canvas for visualization if it doesn't exist
          if (oscilloscopeRef.current && !canvasRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = oscilloscopeRef.current.clientWidth;
            canvas.height = Math.min(150, oscilloscopeRef.current.clientHeight);
            canvas.style.width = "100%";
            oscilloscopeRef.current.appendChild(canvas);
            canvasRef.current = canvas;
          }
        }
      },
      onloaderror: (_, err) => console.error("Load error", err),
      onend: () => {
        onNext();
      },
    });

    howlRef.current = howl;
    // Initially store soundId if should autoplay
    if (isPlaying) {
      soundIdRef.current = howl.play();
    }
    setCurrentTime(howl.seek() as number);
    setProgress(((howl.seek() as number) / howl.duration() || 0) * 100);

    return () => {
      howl.unload();
    };
  }, [currentTrack, onNext]);

  // Play/pause effect
  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;

    if (isPlaying) {
      if (soundIdRef.current !== null) {
        howl.play(soundIdRef.current);
      } else {
        soundIdRef.current = howl.play();
      }
    } else {
      if (soundIdRef.current !== null) {
        howl.pause(soundIdRef.current);
      }
    }
  }, [isPlaying]);

  // Volume/mute effect
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  // Progress polling
  useEffect(() => {
    const update = () => {
      const howl = howlRef.current;
      if (howl && howl.playing()) {
        const t = howl.seek() as number;
        setCurrentTime(t);
        setProgress((t / (howl.duration() || 1)) * 100);
      }
      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Oscilloscope animation loop
  useEffect(() => {
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
    if (isPlaying && analyserRef.current) {
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
    // 1) Unlock media channel once (for iOS)
    if (!hasKicked) {
      kickMediaChannel();
      setHasKicked(true);
    }

    // 2) Resume AudioContext in user gesture
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume();
    }

    // 3) Play or pause directly for immediate feedback
    const h = howlRef.current;
    if (h) {
      if (isPlaying) {
        if (soundIdRef.current !== null) {
          h.pause(soundIdRef.current);
        }
        onPause();
      } else {
        if (soundIdRef.current !== null) {
          h.play(soundIdRef.current);
        } else {
          soundIdRef.current = h.play();
        }
        onPlay();
      }
    }
  };

  // Seek to position
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!howlRef.current) return;

    const progressBar = e.currentTarget;
    const percent = e.nativeEvent.offsetX / progressBar.clientWidth;
    const newTime = percent * (howlRef.current.duration() || 0);

    howlRef.current.seek(newTime);
    setProgress(percent * 100);
  };

  // Toggle playlist visibility
  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  // Play specific track
  const playTrack = (index: number) => {
    if (index === currentTrack) return;

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
    <div
      className="flex flex-col h-full overflow-hidden relative bg-gradient-to-br from-purple-500 via-purple-400 to-indigo-600"
      data-draggable="true"
    >
      {/* Title and Time */}
      <div className="absolute top-0 w-full p-2 z-10">
        <div id="title" className="text-center text-white font-light text-xl">
          {songs[currentTrack].title}
        </div>
        <div
          id="timer"
          className="absolute top-0 left-3 text-white text-lg opacity-90"
        >
          {formatTime(currentTime)}
        </div>
        <div
          id="duration"
          className="absolute top-0 right-3 text-white text-lg opacity-50"
        >
          {formatTime(duration)}
        </div>
      </div>

      {/* Oscilloscope/Waveform */}
      <div
        ref={oscilloscopeRef}
        className="w-full flex-1 flex items-start justify-center pt-4 min-h-0"
      ></div>

      {/* Progress Bar */}
      <div className="w-full px-4 relative mb-2">
        <div
          id="bar"
          className="w-full h-1 bg-foreground/30 cursor-pointer rounded-full overflow-hidden"
          onClick={seek}
        >
          <div
            id="progress"
            className="h-full bg-foreground/90 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-2 pb-3 flex items-center justify-between">
        <button
          data-draggable="false"
          className="text-white w-10 h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity bg-transparent"
          onClick={togglePlaylist}
        >
          <List size={24} />
        </button>
        <div className="flex items-center justify-center gap-4">
          {" "}
          <Button
            apiId="audio-player-controls-previous"
            apiName="Previous Track"
            apiDescription="Skip to the previous track in the playlist"
            onClick={onPrevious}
            className="text-white w-10 h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity bg-transparent"
          >
            <SkipBack size={24} />
          </Button>
          <Button
            apiId="audio-player-controls-play"
            apiName={isPlaying ? "Pause" : "Play"}
            apiDescription={
              isPlaying ? "Pause the current track" : "Play the current track"
            }
            onClick={togglePlay}
            className="text-white w-10 h-10 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity bg-transparent"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>
          <Button
            apiId="audio-player-controls-next"
            apiName="Next Track"
            apiDescription="Skip to the next track in the playlist"
            onClick={onNext}
            className="text-white w-10 h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity bg-transparent"
          >
            <SkipForward size={24} />
          </Button>
        </div>{" "}
        <Button
          apiId="audio-player-controls-mute"
          apiName={isMuted ? "Unmute" : "Mute"}
          apiDescription={
            isMuted ? "Unmute the audio player" : "Mute the audio player"
          }
          onClick={onToggleMute}
          className="text-white w-10 h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity bg-transparent"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume size={24} />}
        </Button>
      </div>

      {/* Playlist Overlay */}
      {showPlaylist && (
        <div
          data-draggable="false"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex flex-col"
        >
          <div className="flex-1 py-10 overflow-auto">
            {songs.map((song, index) => (
              <div
                key={index}
                className={`text-white text-lg py-3 px-6 cursor-pointer hover:bg-white/10 transition ${
                  index === currentTrack ? "font-bold" : "font-light"
                }`}
                onClick={() => playTrack(index)}
                data-draggable="false"
              >
                {song.title}
              </div>
            ))}
          </div>
          <button
            data-draggable="false"
            className="self-center mb-6 text-white py-2 px-6 rounded-full bg-transparent border border-white/30 hover:bg-white/10 transition"
            onClick={togglePlaylist}
          >
            Close
          </button>
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
    </>
  );
};

export default React.memo(AudioPlayerContent);
