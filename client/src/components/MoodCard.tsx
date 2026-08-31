import { useState, useEffect } from 'react';
import { musicApi } from '../services/api';
import { cn } from '../utils/cn';

interface MoodCardProps {
  name: string;
  query: string;
  gradient: string;
  icon: string;
  onSelect: (mood: string, query: string) => void;
}

export default function MoodCard({ name, query, gradient, icon, onSelect }: MoodCardProps) {
  const [artwork, setArtwork] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchArtwork = async () => {
      try {
        const tracks = await musicApi.search(query, 3);
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
      onClick={() => onSelect(name, query)}
      className={cn(
        "group relative aspect-square rounded-xl overflow-hidden text-left",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.05] hover:shadow-lg hover:shadow-black/20",
        "focus:outline-none focus:ring-2 focus:ring-primary/50",
        "active:scale-[0.97]"
      )}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80"
        style={{ background: gradient }}
      />

      {/* Artwork overlay */}
      {artwork && (
        <div className="absolute inset-0 opacity-30 group-hover:opacity-20 transition-opacity duration-300">
          <img
            src={artwork}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
        <span className="text-2xl sm:text-3xl mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
        <span className="text-sm sm:text-base font-semibold text-white drop-shadow-lg">
          {name}
        </span>
      </div>
    </button>
  );
}
