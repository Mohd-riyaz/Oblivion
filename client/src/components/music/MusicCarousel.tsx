import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Track } from '../../types';
import MusicCard from './MusicCard';
import { cn } from '../../utils/cn';

interface MusicCarouselProps {
  title: string;
  tracks: Track[];
  loading: boolean;
  seeAllLink?: string;
}

const AUTO_SLIDE_INTERVAL = 3500; // 3.5 seconds
const SCROLL_AMOUNT_MULTIPLIER = 0.85;

export default function MusicCarousel({ title, tracks, loading, seeAllLink }: MusicCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
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

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

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
  }, [tracks.length, checkScroll]);

  // Reset auto-slide timer
  const resetAutoSlideTimer = useCallback(() => {
    if (autoSlideTimerRef.current) {
      clearTimeout(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }

    if (isReducedMotion || isHovering || isTouching || loading || tracks.length === 0) {
      return;
    }

    autoSlideTimerRef.current = setTimeout(() => {
      autoSlideTimerRef.current = null;
      scroll('right', true);
    }, AUTO_SLIDE_INTERVAL);
  }, [isReducedMotion, isHovering, isTouching, loading, tracks.length]);

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

  const scroll = useCallback((direction: 'left' | 'right', isAuto = false) => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * SCROLL_AMOUNT_MULTIPLIER;

    let targetScrollLeft: number;

    if (direction === 'left') {
      targetScrollLeft = Math.max(0, scrollLeft - scrollAmount);
    } else {
      // Check if we're near the end
      const maxScroll = scrollWidth - clientWidth;
      const newScrollLeft = scrollLeft + scrollAmount;

      if (newScrollLeft >= maxScroll - 10) {
        // Near end - scroll back to start for seamless loop
        targetScrollLeft = 0;
      } else {
        targetScrollLeft = newScrollLeft;
      }
    }

    // Cancel any existing animation
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
        if (isAuto) {
          resetAutoSlideTimer();
        }
        return;
      }

      scrollRef.current.scrollLeft += distance * 0.15;
      scrollRafRef.current = requestAnimationFrame(animateScroll);
    };

    scrollRafRef.current = requestAnimationFrame(animateScroll);

    if (!isAuto) {
      resetAutoSlideTimer();
    }
  }, [resetAutoSlideTimer, checkScroll]);

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
    // Small delay to allow tap to register before resuming auto-slide
    setTimeout(() => setIsTouching(false), 300);
  };

  if (!loading && tracks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          {seeAllLink && (
            <a
              href={seeAllLink}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 whitespace-nowrap"
            >
              See all →
            </a>
          )}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                canScrollLeft
                  ? "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary hover:scale-105"
                  : "bg-muted/20 text-muted-foreground/30 cursor-not-allowed"
              )}
              aria-label={`Scroll left in ${title}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                canScrollRight
                  ? "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary hover:scale-105"
                  : "bg-muted/20 text-muted-foreground/30 cursor-not-allowed"
              )}
              aria-label={`Scroll right in ${title}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 snap-x snap-mandatory"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => (
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
    </section>
  );
}