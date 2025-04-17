import { Howl } from 'howler';
import { List, Pause, Play, SkipBack, SkipForward, Volume, VolumeX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { ApiAudioPlayerHandler } from '@/components/api/ApiAudioPlayer';

// Define WebkitAudioContext interface if it doesn't exist in TypeScript types
interface Window {
  webkitAudioContext: typeof AudioContext;
}

// Define sample songs - in a real app these would come from a database or files
const songs = [
  {
    title: "Vibe Machine",
    file: "/audio/sample.mp3",
    howl: null,
  },
  {
    title: "Rave Digger",
    file: "/audio/sample1.mp3",
    howl: null,
  },
  {
    title: "80s Vibe",
    file: "/audio/sample2.mp3",
    howl: null,
  },
  {
    title: "Running Out",
    file: "/audio/sample3.mp3",
    howl: null,
  },
];

const AudioPlayerContent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const oscilloscopeRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element and visualization
  useEffect(() => {
    // Create audio element
    const audioElement = document.createElement("audio");
    audioElement.crossOrigin = "anonymous";
    audioElement.src = songs[currentTrack].file;
    audioElement.preload = "metadata";
    audioElementRef.current = audioElement;

    // Set up audio context and analyzer for visualization
    const AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    sourceRef.current = source;

    // Create canvas for visualization with specific dimensions
    if (oscilloscopeRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = oscilloscopeRef.current.clientWidth;
      // Set a fixed height for the canvas to prevent layout issues
      canvas.height = Math.min(150, oscilloscopeRef.current.clientHeight);
      canvas.style.width = "100%";
      oscilloscopeRef.current.appendChild(canvas);
      canvasRef.current = canvas;
    }

    // Set up event listeners
    audioElement.addEventListener("timeupdate", updateProgress);
    audioElement.addEventListener("loadedmetadata", () => {
      setDuration(formatTime(audioElement.duration));
    });
    audioElement.addEventListener("ended", () => {
      nextTrack();
    });

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
      audioElement.removeEventListener("timeupdate", updateProgress);
      audioElement.remove();
    };
  }, []);

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

  // Format time in mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update progress bar and time display
  const updateProgress = () => {
    if (!audioElementRef.current) return;

    const currentTime = audioElementRef.current.currentTime;
    const duration = audioElementRef.current.duration || 0;

    setCurrentTime(formatTime(currentTime));
    setProgress((currentTime / duration) * 100);
  };

  // Play/pause toggle
  const togglePlay = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
    } else {
      // Resume or start AudioContext if it's suspended
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
      audioElementRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  // Play action for API
  const handlePlay = () => {
    if (isPlaying) return; // Already playing
    togglePlay();
  };

  // Pause action for API
  const handlePause = () => {
    if (!isPlaying) return; // Already paused
    togglePlay();
  };

  // Skip to previous track
  const prevTrack = () => {
    if (!audioElementRef.current) return;

    const newIndex = (currentTrack - 1 + songs.length) % songs.length;
    setCurrentTrack(newIndex);

    audioElementRef.current.src = songs[newIndex].file;
    if (isPlaying) {
      audioElementRef.current.play();
    }
  };

  // Skip to next track
  const nextTrack = () => {
    if (!audioElementRef.current) return;

    const newIndex = (currentTrack + 1) % songs.length;
    setCurrentTrack(newIndex);

    audioElementRef.current.src = songs[newIndex].file;
    if (isPlaying) {
      audioElementRef.current.play();
    }
  };

  // Set new volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioElementRef.current) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioElementRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  // Set volume directly (for API)
  const handleSetVolume = (newVolume: number) => {
    if (!audioElementRef.current) return;

    setVolume(newVolume);
    audioElementRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioElementRef.current) return;

    if (isMuted) {
      audioElementRef.current.volume = volume;
    } else {
      audioElementRef.current.volume = 0;
    }

    setIsMuted(!isMuted);
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

    setCurrentTrack(index);
    audioElementRef.current.src = songs[index].file;

    if (isPlaying) {
      audioElementRef.current.play();
    } else {
      togglePlay();
    }
  };

  return (
    <ApiAudioPlayerHandler
      apiId="audio-player-controls"
      onPlay={handlePlay}
      onPause={handlePause}
      onNext={nextTrack}
      onPrevious={prevTrack}
      onToggleMute={toggleMute}
      onSetVolume={handleSetVolume}
      isPlaying={isPlaying}
      currentTrack={currentTrack}
      volume={volume}
      isMuted={isMuted}
    >
      <div className="flex flex-col h-full p-4 bg-gray-900 text-white">
        {/* Oscilloscope visualization */}
        <div
          ref={oscilloscopeRef}
          className="w-full h-32 mb-4 bg-gray-800 rounded-md overflow-hidden"
        ></div>

        {/* Track info */}
        <div className="mb-4">
          <div className="text-xl font-semibold">
            {songs[currentTrack].title}
          </div>
          <div className="text-sm text-gray-400">
            Track {currentTrack + 1} of {songs.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div
            className="h-2 bg-gray-700 rounded-full cursor-pointer"
            onClick={seek}
          >
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevTrack}
            className="p-2 hover:bg-gray-800 rounded-full"
            aria-label="Previous track"
          >
            <SkipBack size={24} />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 bg-blue-500 hover:bg-blue-600 rounded-full"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={nextTrack}
            className="p-2 hover:bg-gray-800 rounded-full"
            aria-label="Next track"
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Secondary controls */}
        <div className="flex justify-between items-center">
          <button
            onClick={togglePlaylist}
            className="p-2 hover:bg-gray-800 rounded-full relative"
            aria-label="Playlist"
          >
            <List size={20} />
          </button>

          <div className="flex items-center">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-gray-800 rounded-full"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume size={20} />}
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                showVolumeSlider ? "w-24 ml-2" : "w-0"
              }`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full"
              />
            </div>

            <button
              onClick={toggleVolumeSlider}
              className="p-2 hover:bg-gray-800 rounded-full ml-1"
              aria-label="Volume control"
            >
              {volume > 0.5 ? (
                <Volume size={20} />
              ) : volume > 0 ? (
                <Volume size={20} />
              ) : (
                <VolumeX size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Playlist */}
        {showPlaylist && (
          <div className="mt-4 bg-gray-800 rounded-md p-2 max-h-40 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-2">Playlist</h3>
            <ul>
              {songs.map((song, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer hover:bg-gray-700 rounded ${
                    currentTrack === index ? "bg-gray-700 text-blue-400" : ""
                  }`}
                  onClick={() => playTrack(index)}
                >
                  {song.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ApiAudioPlayerHandler>
  );
};

export default AudioPlayerContent;
