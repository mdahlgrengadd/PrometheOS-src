import { Howl } from 'howler';
import { List, Pause, Play, SkipBack, SkipForward, Volume, VolumeX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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

    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;

    audioElementRef.current.currentTime =
      percent * audioElementRef.current.duration;
  };

  // Toggle playlist visibility
  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  // Toggle volume slider visibility
  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  // Play a track from the playlist
  const playTrack = (index: number) => {
    if (!audioElementRef.current) return;

    setCurrentTrack(index);
    audioElementRef.current.src = songs[index].file;
    audioElementRef.current.play();
    setIsPlaying(true);
    setShowPlaylist(false);
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
            onClick={prevTrack}
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
            onClick={nextTrack}
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
      )}
    </div>
  );
};

export default AudioPlayerContent;
