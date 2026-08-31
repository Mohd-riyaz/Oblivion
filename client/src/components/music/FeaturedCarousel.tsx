import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Track } from '../../types';
import MusicCard from './MusicCard';
import { cn } from '../../utils/cn';

interface FeaturedCarouselProps {
  tracks: Track[];
  loading: boolean;
}

const AUTO_SLIDE_INTERVAL = 4000;
const VISIBLE_CARDS = { base: 2, sm: 3, lg: 4 };

export default function FeaturedCarousel({ tracks, loading }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const autoSlideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafRef = useRef<number | null>(null);

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

  // Calculate max index based on visible cards
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return VISIBLE_CARDS.base;
    if (window.innerWidth >= 1024) return VISIBLE_CARDS.lg;
    if (window.innerWidth >= 640) return VISIBLE_CARDS.sm;
    return VISIBLE_CARDS.base;
  };

  const visibleCount = getVisibleCount();
  const maxIndex = Math.max(0, tracks.length - visibleCount);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth / visibleCount * 0.85;
      const newIndex = Math.round(scrollLeft / scrollAmount);
      setCurrentIndex(Math.max(0, Math.min(newIndex, maxIndex)));
    }
  }, [maxIndex, visibleCount]);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [tracks.length, checkScroll, maxIndex, visibleCount]);

  // Reset auto-slide timer
  const resetAutoSlideTimer = useCallback(() => {
    if (autoSlideTimerRef.current) {
      clearTimeout(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }

    if (isReducedMotion || isHovering || isTouching || loading || tracks.length <= visibleCount) {
      return;
    }

    autoSlideTimerRef.current = setTimeout(() => {
      autoSlideTimerRef.current = null;
      slideNext();
    }, AUTO_SLIDE_INTERVAL);
  }, [isReducedMotion, isHovering, isTouching, loading, tracks.length, visibleCount, maxIndex]);

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

  const slideTo = useCallback((index: number) => {
    if (!scrollRef.current || index < 0 || index > maxIndex) return;

    const { clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth / visibleCount * 0.85;
    const targetScrollLeft = index * scrollAmount;

    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
    }

    const animateScroll = () => {
      if (!scrollRef.current) return;

      const currentLeft = scrollRef.current.scrollLeft;
      const distance = targetScrollLeft - currentLeft;

      if (Math.abs(distance) < 1) {
        scrollRef.current.scrollLeft = targetScrollLeft;
        checkScroll();
        scrollRafRef.current = null;
        return;
      }

      scrollRef.current.scrollLeft += distance * 0.15;
      scrollRafRef.current = requestAnimationFrame(animateScroll);
    };

    scrollRafRef.current = requestAnimationFrame(animateScroll);
  }, [maxIndex, visibleCount]);

  const slideNext = useCallback(() => {
    const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
    slideTo(nextIndex);
  }, [currentIndex, maxIndex, slideTo]);

  const slidePrev = useCallback(() => {
    const prevIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    setCurrentIndex(prevIndex);
    slideTo(prevIndex);
  }, [currentIndex, maxIndex, slideTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSlideTimerRef.current) {
        clearTimeout(autoSlideTimerRef.current);
      }
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  const handleTouchStart = () => {
    setIsTouching(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsTouching(false), 300);
  };

  if (!loading && tracks.length === 0) {
    return null;
  }

  // If not enough tracks for carousel, show as simple grid
  if (!loading && tracks.length <= visibleCount) {
    return (
      <section className="space-y-3">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 snap-x snap-mandatory">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="w-[140px] sm:w-[160px] lg:w-[180px] flex-shrink-0 snap-start"
            >
              <MusicCard track={track} queue={tracks} index={index} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 snap-x snap-mandatory"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-[140px] sm:w-[160px] lg:w-[180px] flex-shrink-0 snap-start"
            >
              <div className="aspect-square rounded-lg bg-muted mb-2 relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              <div className="h-3.5 bg-muted rounded w-3/4 mb-1.5 relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
              <div className="h-3 bg-muted rounded w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer" />
              </div>
            </div>
          ))
        ) : (
          tracks.map((track, index) => (
            <div
              key={track.id}
              className="w-[140px] sm:w-[160px] lg:w-[180px] flex-shrink-0 snap-start"
            >
              <MusicCard track={track} queue={tracks} index={index} />
            </div>
          ))
        )}
      </div>

      {/* Controls & Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={slidePrev}
          disabled={loading || tracks.length <= visibleCount}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200",
            "hover:bg-muted/50 text-muted-foreground hover:text-primary",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          )}
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Pagination dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                slideTo(i);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                currentIndex === i
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={slideNext}
          disabled={loading || tracks.length <= visibleCount}
          className={cn(
            "p-1.5 rounded-full transition-all duration-200",
            "hover:bg-muted/50 text-muted-foreground hover:text-primary",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          )}
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}