import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [logoVisible, setLogoVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionPreference = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionPreference);

    // Start logo animation after a brief delay
    const logoTimer = setTimeout(() => {
      setLogoVisible(true);
    }, 100);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionPreference);
      clearTimeout(logoTimer);
    };
  }, []);

  useEffect(() => {
    // Determine exit timing based on motion preference
    const exitDelay = isReducedMotion ? 800 : 2200;

    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, exitDelay);

    // Call onComplete after fade-out animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, exitDelay + 500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, isReducedMotion]);

  useEffect(() => {
    // Prevent scrolling while loading screen is visible
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isVisible}
    >
      {/* Subtle radial glow behind logo */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full transition-opacity duration-1000 ${
          logoVisible ? 'opacity-100' : 'opacity-0'
        } ${isReducedMotion ? '' : 'animate-pulse-slow'}`}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Logo container */}
      <div
        className={`relative flex flex-col items-center transition-all ${
          isReducedMotion ? 'duration-300' : 'duration-1000'
        } ${logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* OBLIVION text */}
        <div className="flex items-center gap-3">
          <Music
            className={`w-8 h-8 sm:w-10 sm:h-10 text-primary transition-opacity duration-1000 ${
              logoVisible ? 'opacity-100' : 'opacity-0'
            } ${isReducedMotion ? '' : 'animate-fade-in'}`}
            aria-hidden="true"
          />
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary transition-opacity duration-1000 ${
              logoVisible ? 'opacity-100' : 'opacity-0'
            } ${isReducedMotion ? '' : 'animate-fade-in'}`}
          >
            OBLIVION
          </h1>
        </div>

        {/* Optional subtle equalizer bars */}
        {!isReducedMotion && (
          <div
            className={`flex items-end justify-center gap-1 mt-8 h-6 transition-opacity duration-700 delay-500 ${
              logoVisible ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          >
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className="w-1 bg-primary/40 rounded-full animate-equalizer"
                style={{
                  animationDelay: `${bar * 0.15}s`,
                  height: '100%',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
