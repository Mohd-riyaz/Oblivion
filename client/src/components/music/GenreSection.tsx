import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Track } from '../../types';
import MusicCard from '../music/MusicCard';

interface GenreSectionProps {
  title: string;
  query: string;
  tracks: Track[];
  loading: boolean;
}

export default function GenreSection({ title, query, tracks, loading }: GenreSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!loading && tracks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        <div className="flex items-center gap-4">
          <a
            href={`/search?q=${encodeURIComponent(query)}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            See all →
          </a>
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              aria-label={`Scroll left in ${title}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              aria-label={`Scroll right in ${title}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 pt-1 px-1 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-[160px] sm:w-[200px] flex-shrink-0 snap-start animate-pulse"
            >
              <div className="aspect-square rounded-lg bg-muted mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))
        ) : (
          tracks.map((track) => (
            <div
              key={track.id}
              className="w-[160px] sm:w-[200px] flex-shrink-0 snap-start"
            >
              <MusicCard track={track} queue={tracks} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
