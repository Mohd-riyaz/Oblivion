import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { Track } from '../../types';
import { usePlayerStore } from '../../stores/playerStore';
import { cn } from '../../utils/cn';

interface FeaturedBannerProps {
  tracks: Track[];
  loading: boolean;
}

const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

export default function FeaturedBanner({ tracks, loading }: FeaturedBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const autoSlideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionPreference = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionPreference);
    return () => mediaQuery.removeEventListener('change', handleMotionPreference);
  }, []);

  // Navigate to a specific slide
  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  }, [currentIndex, isTransitioning]);

  // Go to next slide
  const goToNext = useCallback(() => {
    if (tracks.length <= 1) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    goToSlide(nextIndex);
  }, [currentIndex, tracks.length, goToSlide]);

  // Go to previous slide
  const goToPrev = useCallback(() => {
    if (tracks.length <= 1) return;
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  }, [currentIndex, tracks.length, goToSlide]);

  // Reset auto-slide timer
  const resetAutoSlideTimer = useCallback(() => {
    if (autoSlideTimerRef.current) {
      clearTimeout(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }

    if (isReducedMotion || isHovering || loading || tracks.length <= 1) {
      return;
    }

    autoSlideTimerRef.current = setTimeout(() => {
      autoSlideTimerRef.current = null;
      goToNext();
    }, AUTO_SLIDE_INTERVAL);
  }, [isReducedMotion, isHovering, loading, tracks.length, goToNext]);

  // Auto-slide timer management
  useEffect(() => {
    resetAutoSlideTimer();
    return () => {
      if (autoSlideTimerRef.current) {
        clearTimeout(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [resetAutoSlideTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSlideTimerRef.current) {
        clearTimeout(autoSlideTimerRef.current);
      }
    };
  }, []);

  // Handle play button click
  const handlePlay = (track: Track) => {
    if (!track.streamUrl) return;

    if (currentTrack?.id === track.id) {
      usePlayerStore.getState().togglePlay();
      return;
    }

    playTrack(track, tracks);
  };

  if (loading) {
    return (
      <div className="relative w-full aspect-[4/1] sm:aspect-[4/1] md:aspect-[5/1] rounded-xl overflow-hidden bg-muted animate-pulse">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    );
  }

  if (tracks.length === 0) {
    return null;
  }

  const currentSong = tracks[currentIndex];
  const isCurrentTrackPlaying = currentTrack?.id === currentSong.id && isPlaying;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Banner Container */}
      <div className="relative w-full aspect-[4/1] sm:aspect-[4/1] md:aspect-[5/1] rounded-xl overflow-hidden group">
        {/* Background Artwork */}
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          >
            {track.artwork ? (
              <img
                src={track.artwork}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-surface" />
            )}
          </div>
        ))}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 md:p-6">
          {/* Genre/Mood Label */}
          {currentSong.genre && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white/80 mb-2 w-fit">
              {currentSong.genre}
            </span>
          )}

          {/* Song Title */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 line-clamp-1 max-w-xl">
            {currentSong.title}
          </h2>

          {/* Artist Name */}
          <p className="text-sm sm:text-base text-white/70 mb-3 sm:mb-4">
            {currentSong.artist}
          </p>

          {/* Play Button */}
          <button
            onClick={() => handlePlay(currentSong)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm",
              "transition-all duration-200 ease-out",
              "hover:scale-105 active:scale-95",
              isCurrentTrackPlaying
                ? "bg-white text-black"
                : "bg-primary text-primary-foreground"
            )}
          >
            {isCurrentTrackPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 ml-0.5" />
                <span>Play</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Arrows - Desktop */}
        {tracks.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className={cn(
                "hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                "bg-black/40 backdrop-blur-sm text-white/80",
                "transition-all duration-200",
                "opacity-0 group-hover:opacity-100",
                "hover:bg-black/60 hover:text-white hover:scale-110"
              )}
              aria-label="Previous song"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className={cn(
                "hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
                "bg-black/40 backdrop-blur-sm text-white/80",
                "transition-all duration-200",
                "opacity-0 group-hover:opacity-100",
                "hover:bg-black/60 hover:text-white hover:scale-110"
              )}
              aria-label="Next song"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {tracks.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {tracks.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "bg-primary w-4"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to song ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}