import { useState, useEffect } from 'react';
import { musicApi } from '../services/api';
import { cn } from '../utils/cn';

interface GenreCardProps {
  name: string;
  query: string;
  gradient: string;
  onClick: (query: string) => void;
}

export default function GenreCard({ name, query, gradient, onClick }: GenreCardProps) {
  const [artwork, setArtwork] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchArtwork = async () => {
      try {
        const tracks = await musicApi.search(query, 5);
        if (!cancelled && tracks.length > 0 && tracks[0].artwork) {
          setArtwork(tracks[0].artwork);
        }
      } catch {
        // Silently fail - gradient background will show
      }
    };

    fetchArtwork();
    return () => { cancelled = true; };
  }, [query]);

  return (
    <button
      onClick={() => onClick(query)}
      className={cn(
        "group relative aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden text-left",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.03] hover:shadow-lg hover:shadow-black/20",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "active:scale-[0.98]"
      )}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80"
        style={{ background: gradient }}
      />

      {/* Artwork overlay */}
      {artwork && (
        <div className="absolute inset-0 opacity-40 group-hover:opacity-30 transition-opacity duration-300">
          <img
            src={artwork}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Genre name */}
      <div className="absolute inset-0 flex items-end p-4">
        <span className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">
          {name}
        </span>
      </div>

      {/* Hover indicator */}
      <div className={cn(
        "absolute top-3 right-3 opacity-0 transition-all duration-200",
        "group-hover:opacity-100"
      )}>
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
