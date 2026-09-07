import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Heart, ListPlus, Sparkles, Volume2 } from 'lucide-react';
import { Track } from '../../types';
import { usePlayerStore } from '../../stores/playerStore';
import { cn } from '../../utils/cn';

interface FeaturedBannerProps {
  tracks: Track[];
  loading: boolean;
}

const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds per slide

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function FeaturedBanner({ tracks, loading }: FeaturedBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animKey, setAnimKey] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [likedTracks, setLikedTracks] = useState<Record<number, boolean>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const autoSlideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = usePlayerStore();

  // Navigate to slide with direction handling
  const goToSlide = useCallback((targetIndex: number, forcedDirection?: 'next' | 'prev') => {
    if (targetIndex === currentIndex || tracks.length <= 1) return;
    
    const newDir = forcedDirection || (targetIndex > currentIndex ? 'next' : 'prev');
    setDirection(newDir);
    setCurrentIndex(targetIndex);
    setAnimKey(prev => prev + 1);
  }, [currentIndex, tracks.length]);

  const goToNext = useCallback(() => {
    if (tracks.length <= 1) return;
    const nextIdx = (currentIndex + 1) % tracks.length;
    goToSlide(nextIdx, 'next');
  }, [currentIndex, tracks.length, goToSlide]);

  const goToPrev = useCallback(() => {
    if (tracks.length <= 1) return;
    const prevIdx = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    goToSlide(prevIdx, 'prev');
  }, [currentIndex, tracks.length, goToSlide]);

  // Auto-slide timer management
  const resetAutoSlideTimer = useCallback(() => {
    if (autoSlideTimerRef.current) {
      clearTimeout(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }

    if (isHovering || loading || tracks.length <= 1) {
      return;
    }

    autoSlideTimerRef.current = setTimeout(() => {
      autoSlideTimerRef.current = null;
      goToNext();
    }, AUTO_SLIDE_INTERVAL);
  }, [isHovering, loading, tracks.length, goToNext]);

  useEffect(() => {
    resetAutoSlideTimer();
    return () => {
      if (autoSlideTimerRef.current) {
        clearTimeout(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [currentIndex, resetAutoSlideTimer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    setTouchStartX(null);
  };

  // Play button handler
  const handlePlay = (track: Track) => {
    if (!track.streamUrl) return;

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    playTrack(track, tracks);
  };

  // Toggle favorite
  const toggleLike = (trackId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  // Add current slide to queue
  const handleAddToQueue = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
  };

  // Skeleton loading state
  if (loading) {
    return (
      <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] rounded-3xl overflow-hidden bg-surface/40 border border-white/5 animate-pulse">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="absolute bottom-6 left-6 right-6 h-20 bg-muted/40 rounded-2xl" />
      </div>
    );
  }

  if (tracks.length === 0) return null;

  const currentSong = tracks[currentIndex];
  const isCurrentTrackPlaying = currentTrack?.id === currentSong.id && isPlaying;
  const isLiked = !!likedTracks[currentSong.id];

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl group select-none transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient Glow Backdrop with Smooth Cross-Fade */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {tracks.map((track, idx) => (
          <div
            key={track.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              idx === currentIndex ? "opacity-100 scale-110" : "opacity-0 scale-100"
            )}
          >
            <img
              src={track.artwork || undefined}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-35 transform scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/50 to-[#0a0a0a]/90" />
          </div>
        ))}
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 p-5 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[340px] sm:min-h-[380px] lg:min-h-[420px]">
        {/* Top Feature Bar Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>Featured Spotlight</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Numerical Slide Indicator */}
            <div className="text-xs font-mono font-medium text-white/70 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="text-primary font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
              <span className="mx-1 text-white/40">/</span>
              <span>{String(tracks.length).padStart(2, '0')}</span>
            </div>

            {/* Manual Prev/Next Navigation Controls */}
            {tracks.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={goToPrev}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 transition-all duration-200 border border-white/10 hover:border-white/25"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToNext}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 transition-all duration-200 border border-white/10 hover:border-white/25"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Middle Content: Animated Track Card & Details */}
        <div
          key={animKey}
          className={cn(
            "grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-auto",
            direction === 'next' ? 'animate-slide-in-next' : 'animate-slide-in-prev'
          )}
        >
          {/* Track Cover Artwork Card */}
          <div className="md:col-span-4 lg:col-span-3 flex justify-center md:justify-start">
            <div
              onClick={() => handlePlay(currentSong)}
              className="group/art relative w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56 rounded-2xl overflow-hidden bg-surface shadow-2xl ring-1 ring-white/15 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-primary/20"
            >
              <img
                src={currentSong.artwork || undefined}
                alt={currentSong.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/art:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover/art:opacity-60 transition-opacity duration-300" />
              
              {/* Animated Equalizer Wave / Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                  isCurrentTrackPlaying
                    ? "bg-white text-black scale-100"
                    : "bg-primary/90 text-primary-foreground group-hover/art:scale-110 group-hover/art:bg-primary"
                )}>
                  {isCurrentTrackPlaying ? (
                    <div className="flex items-end justify-center gap-1 h-5 w-5">
                      <span className="w-1 bg-black animate-playing-bar h-full" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 bg-black animate-playing-bar h-full" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 bg-black animate-playing-bar h-full" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <Play className="w-6 h-6 ml-1 fill-current" />
                  )}
                </div>
              </div>

              {/* Playing status pill */}
              {isCurrentTrackPlaying && (
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-primary px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                  <Volume2 className="w-3 h-3" />
                  NOW PLAYING
                </div>
              )}
            </div>
          </div>

          {/* Track Details & Typography */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-center text-center md:text-left space-y-3">
            {/* Genre & Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 animate-slide-text-up">
              {currentSong.genre && (
                <span className="px-3 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10 text-xs font-medium backdrop-blur-sm">
                  {currentSong.genre}
                </span>
              )}
              {currentSong.mood && (
                <span className="px-3 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-medium backdrop-blur-sm">
                  {currentSong.mood}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-white/60 border border-white/5 text-xs font-mono">
                {formatDuration(currentSong.duration)}
              </span>
            </div>

            {/* Song Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight line-clamp-2 leading-tight animate-slide-text-up" style={{ animationDelay: '75ms' }}>
              {currentSong.title}
            </h1>

            {/* Artist & Sub-info */}
            <div className="flex items-center justify-center md:justify-start gap-3 text-white/80 animate-slide-text-up" style={{ animationDelay: '150ms' }}>
              <p className="text-base sm:text-lg font-semibold text-white/90 hover:underline cursor-pointer">
                {currentSong.artist}
              </p>
              {currentSong.artistHandle && (
                <span className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 font-mono">
                  @{currentSong.artistHandle}
                </span>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 animate-slide-text-up" style={{ animationDelay: '225ms' }}>
              {/* Play CTA Button */}
              <button
                onClick={() => handlePlay(currentSong)}
                className={cn(
                  "px-6 py-3 rounded-full font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95",
                  isCurrentTrackPlaying
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25"
                )}
              >
                {isCurrentTrackPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Play Song</span>
                  </>
                )}
              </button>

              {/* Heart / Favorite Button */}
              <button
                onClick={(e) => toggleLike(currentSong.id, e)}
                className={cn(
                  "p-3 rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md",
                  isLiked
                    ? "bg-red-500/20 text-red-500 border-red-500/30"
                    : "bg-white/10 text-white/80 hover:text-white border-white/10 hover:border-white/20 hover:bg-white/15"
                )}
                aria-label="Favorite Track"
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
              </button>

              {/* Add to Queue Button */}
              <button
                onClick={(e) => handleAddToQueue(currentSong, e)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
                title="Add to Queue"
                aria-label="Add to Queue"
              >
                <ListPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Bar: Interactive Bottom Slide Tabs with Active Progress Timer Bar */}
        {tracks.length > 1 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {tracks.map((track, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={track.id}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "relative group/tab p-2 rounded-xl text-left transition-all duration-300 overflow-hidden flex items-center gap-2.5 border",
                      isActive
                        ? "bg-white/15 border-white/25 shadow-lg shadow-black/40"
                        : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15 text-white/60"
                    )}
                  >
                    {/* Active Progress Top Bar Indicator */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 overflow-hidden">
                        <div
                          key={`progress-${currentIndex}-${animKey}`}
                          className={cn(
                            "h-full bg-primary",
                            !isHovering && "animate-feature-progress"
                          )}
                          style={{
                            animationDuration: `${AUTO_SLIDE_INTERVAL}ms`,
                            animationPlayState: isHovering ? 'paused' : 'running'
                          }}
                        />
                      </div>
                    )}

                    {/* Mini Cover Thumbnail */}
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-white/10 relative">
                      <img
                        src={track.artwork || undefined}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {isActive && currentTrack?.id === track.id && isPlaying && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="w-1 h-3 bg-primary animate-pulse rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Mini Info */}
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-xs font-bold line-clamp-1 transition-colors",
                        isActive ? "text-white" : "text-white/70 group-hover/tab:text-white"
                      )}>
                        {track.title}
                      </p>
                      <p className="text-[10px] text-white/40 line-clamp-1 font-medium">
                        {track.artist}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
