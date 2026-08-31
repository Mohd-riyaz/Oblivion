import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as LucideSearch, Music, X } from 'lucide-react';
import { Track } from '../types';
import { musicApi } from '../services/api';
import MusicCard from '../components/music/MusicCard';
import TrackList from '../components/TrackList';
import { cn } from '../utils/cn';

type ViewMode = 'grid' | 'list';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [resultsVisible, setResultsVisible] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      setResultsVisible(false);
      return;
    }

    setLoading(true);
    setError(null);
    setResultsVisible(false);

    try {
      const tracks = await musicApi.search(searchQuery, 30);
      setResults(tracks);
      // Trigger entrance animation
      requestAnimationFrame(() => setResultsVisible(true));

      if (tracks.length === 0) {
        setError('No tracks found. Try a different search.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  return (
    <div className="space-y-8 animate-page-enter">
      {/* Header */}
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">Find your next favorite track</p>
      </header>

      {/* Search Input */}
      <div className="relative max-w-2xl">
        <LucideSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for tracks, artists, or genres..."
          className={cn(
            "w-full bg-surface border border-muted px-4 py-4 pl-12 pr-12 text-lg rounded-xl",
            "placeholder:text-muted-foreground outline-none",
            "transition-all duration-200 ease-out",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface/80"
          )}
          aria-label="Search for music"
          autoFocus
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors duration-200"
            aria-label="Clear search"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        {loading && (
          <Loader2
            className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin"
            aria-hidden="true"
          />
        )}
      </div>

      {/* View Toggle */}
      {results.length > 0 && (
        <div className="flex items-center gap-2 justify-end animate-fade-in">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              viewMode === 'grid'
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:text-primary hover:bg-muted/50"
            )}
            aria-label="Grid view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              viewMode === 'list'
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:text-primary hover:bg-muted/50"
            )}
            aria-label="List view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Search Results */}
      {debouncedQuery && (
        <section>
          {/* Loading */}
          {loading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <MusicCardSkeleton key={item} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <TrackSkeleton key={item} />
                ))}
              </div>
            )
          ) : error ? (
            /* Error / Empty */
            <div className="text-center py-16 animate-fade-in">
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-muted-foreground text-lg">{error}</p>
              <p className="text-muted-foreground/70 text-sm mt-2">Try searching for something else</p>
            </div>
          ) : (
            /* Results */
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {results.map((track, index) => (
                    <div
                      key={track.id}
                      className={cn(
                        "transition-all duration-300 ease-out",
                        resultsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      )}
                      style={{ transitionDelay: `${Math.min(index * 30, 300)}ms` }}
                    >
                      <MusicCard track={track} queue={results} index={index} />
                    </div>
                  ))}
                </div>
              ) : (
                <TrackList tracks={results} queue={results} showHeader showIndex />
              )}
            </>
          )}
        </section>
      )}

      {/* Empty State - No search query */}
      {!debouncedQuery && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <LucideSearch className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Search for music</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Discover millions of tracks from artists around the world. Start typing to find your next favorite song.
          </p>
        </div>
      )}
    </div>
  );
}

function MusicCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-lg bg-muted mb-3 relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
      <div className="h-4 bg-muted rounded w-3/4 mb-2 relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
      <div className="h-3 bg-muted rounded w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    </div>
  );
}

function TrackSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-4 py-2">
      <div className="w-10 h-10 rounded bg-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
      <div className="h-4 bg-muted rounded w-12" />
    </div>
  );
}
