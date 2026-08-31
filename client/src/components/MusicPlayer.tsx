import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  X,
  ChevronUp,
  ChevronDown,
  ListMusic,
} from 'lucide-react';
import { usePlayerStore } from '../stores/playerStore';
import { cn } from '../utils/cn';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    queue,
    currentIndex,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
  } = usePlayerStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [playerVisible, setPlayerVisible] = useState(false);

  // Create the audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      if (currentIndex < queue.length - 1) {
        nextTrack();
      } else {
        usePlayerStore.setState({ isPlaying: false });
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      console.error('Audio playback error');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [nextTrack, currentIndex, queue.length]);

  // Change audio source whenever the track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.streamUrl;
    audio.load();
    setCurrentTime(0);
    setDuration(currentTrack.duration || 0);

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Audio playback error:', error);
      });
    }
  }, [currentTrack]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Audio playback error:', error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentTrack) togglePlay();
          break;
        case 'ArrowRight':
          if (e.metaKey || e.ctrlKey) nextTrack();
          break;
        case 'ArrowLeft':
          if (e.metaKey || e.ctrlKey) previousTrack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, togglePlay, nextTrack, previousTrack]);

  // Handle player visibility animation
  useEffect(() => {
    if (currentTrack && !playerVisible) {
      setPlayerVisible(true);
    }
  }, [currentTrack, playerVisible]);

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !audioRef.current) return;

    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      {/* Mobile Expanded Player */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Collapse player"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <span className="text-sm text-muted-foreground">Now Playing</span>
            <button
              className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Queue"
            >
              <ListMusic className="w-6 h-6" />
            </button>
          </div>

          {/* Artwork */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-muted shadow-2xl">
              {currentTrack.artwork ? (
                <img
                  src={currentTrack.artwork}
                  alt={`${currentTrack.title} by ${currentTrack.artist}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Track Info */}
          <div className="px-8 text-center">
            <h2 className="text-xl font-bold truncate">{currentTrack.title}</h2>
            <p className="text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>

          {/* Progress */}
          <div className="px-8 mt-8">
            <div
              ref={progressRef}
              className="h-2 bg-muted rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
            >
              <div
                className="absolute h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute w-4 h-4 bg-primary rounded-full -top-1 transition-all duration-100 opacity-0 hover:opacity-100"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="px-8 mt-6 flex items-center justify-center gap-8">
            <button
              onClick={previousTrack}
              className="p-3 rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Previous track"
            >
              <SkipBack className="w-8 h-8" />
            </button>
            <button
              onClick={togglePlay}
              className={cn(
                "w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center",
                "transition-all duration-200 ease-out",
                "hover:scale-105",
                "active:scale-95"
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="p-3 rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Next track"
            >
              <SkipForward className="w-8 h-8" />
            </button>
          </div>

          {/* Volume */}
          <div className="px-8 mt-8 flex items-center gap-4">
            <button
              onClick={handleVolumeToggle}
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon className="w-6 h-6" />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="flex-1 accent-primary"
              aria-label="Volume"
            />
          </div>
        </div>
      )}

      {/* Desktop / Mobile Mini Player */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 border-t border-muted bg-background/95 backdrop-blur-lg",
          "transition-all duration-500 ease-out",
          isExpanded && "md:relative",
          playerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
        )}
      >
        {/* Progress bar (thin, at top) */}
        <div
          ref={progressRef}
          className="h-1 bg-muted cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-primary transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Track information */}
            <div
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer md:cursor-default"
              onClick={() => setIsExpanded(true)}
            >
              <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {currentTrack.artwork ? (
                  <img
                    src={currentTrack.artwork}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-medium text-sm truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Mobile expand button */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors duration-200 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                aria-label="Expand player"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            {/* Controls - Center */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={previousTrack}
                className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
                aria-label="Previous track"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className={cn(
                  "w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center",
                  "transition-all duration-200 ease-out",
                  "hover:scale-105",
                  "active:scale-95"
                )}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
                aria-label="Next track"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Time - Desktop */}
            <div className="hidden md:block text-xs text-muted-foreground w-24 text-center">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume - Desktop */}
            <div className="hidden md:flex items-center gap-2 w-32">
              <button
                onClick={handleVolumeToggle}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                <VolumeIcon className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-full accent-primary"
                aria-label="Volume"
              />
            </div>

            {/* Mobile Play Button */}
            <button
              onClick={togglePlay}
              className={cn(
                "md:hidden w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center",
                "transition-all duration-200 ease-out",
                "hover:scale-105",
                "active:scale-95"
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                audioRef.current?.pause();
                usePlayerStore.setState({
                  currentTrack: null,
                  isPlaying: false,
                  queue: [],
                  currentIndex: -1,
                });
              }}
              className="hidden md:block p-2 rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
