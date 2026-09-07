import { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Track } from '../types';
import { musicApi } from '../services/api';
import MusicCarousel from '../components/music/MusicCarousel';
import AnimatedSection from '../components/music/AnimatedSection';
import FeaturedBanner from '../components/music/FeaturedBanner';

interface GenreConfig {
  name: string;
  query: string;
  limit?: number;
  endpoint?: 'search' | 'genre' | 'trending';
}

const GENRES: GenreConfig[] = [
  { name: 'Trending Now', query: 'trending popular', limit: 20, endpoint: 'trending' },
  { name: 'Pop', query: 'pop', limit: 15, endpoint: 'genre' },
  { name: 'Hip-Hop', query: 'hip hop', limit: 15, endpoint: 'genre' },
  { name: 'Electronic', query: 'electronic', limit: 15, endpoint: 'genre' },
  { name: 'Rock', query: 'rock', limit: 15, endpoint: 'genre' },
  { name: 'R&B', query: 'r&b soul', limit: 15, endpoint: 'genre' },
  { name: 'Lo-Fi', query: 'lofi chill', limit: 15, endpoint: 'genre' },
  { name: 'Ambient', query: 'ambient', limit: 15, endpoint: 'genre' },
  { name: 'Dance', query: 'dance', limit: 15, endpoint: 'genre' },
];

interface GenreState {
  tracks: Track[];
  loading: boolean;
}

export default function Home() {
  const [genreStates, setGenreStates] = useState<Record<string, GenreState>>({});
  const [error, setError] = useState<string | null>(null);
  const [bannerTracks, setBannerTracks] = useState<Track[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);

  const fetchAllGenres = async () => {
    setError(null);

    // Fetch featured tracks for the banner (using trending)
    try {
      const tracks = await musicApi.getTrending(8);
      setBannerTracks(tracks);
    } catch (err) {
      console.error('Failed to fetch banner tracks:', err);
      setBannerTracks([]);
    } finally {
      setBannerLoading(false);
    }

    const promises = GENRES.map(async (genre) => {
      try {
        let tracks: Track[] = [];
        if (genre.endpoint === 'trending') {
          tracks = await musicApi.getTrending(genre.limit || 20);
        } else if (genre.endpoint === 'genre') {
          tracks = await musicApi.getGenreTracks(genre.query, genre.limit || 15);
        } else {
          tracks = await musicApi.search(genre.query, genre.limit || 15);
        }
        return { name: genre.name, tracks, loading: false };
      } catch (err) {
        console.error(`Failed to fetch ${genre.name}:`, err);
        return { name: genre.name, tracks: [] as Track[], loading: false };
      }
    });

    const results = await Promise.allSettled(promises);

    const newStates: Record<string, GenreState> = {};
    let hasAnySuccess = false;
    const allTrackIds = new Set<number>();

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { name, tracks, loading } = result.value;
        const uniqueTracks = tracks.filter(track => {
          if (allTrackIds.has(track.id)) {
            return false;
          }
          allTrackIds.add(track.id);
          return true;
        });
        newStates[name] = { tracks: uniqueTracks, loading };
        if (uniqueTracks.length > 0) {
          hasAnySuccess = true;
        }
      } else {
        const name = GENRES[index].name;
        newStates[name] = { tracks: [], loading: false };
      }
    });

    setGenreStates(newStates);

    if (!hasAnySuccess) {
      setError('Music is temporarily unavailable.');
    }
  };

  useEffect(() => {
    fetchAllGenres();
  }, []);

  const visibleGenres = useMemo(() => {
    return GENRES.filter(g => {
      const state = genreStates[g.name];
      return state && state.tracks.length > 0;
    });
  }, [genreStates]);

  return (
    <div className="min-h-screen animate-page-enter">
      {/* Featured Song Hero Banner */}
      <section className="px-4 sm:px-8 lg:px-12 pt-3 pb-8 w-full max-w-[1600px] mx-auto">
        <FeaturedBanner
          tracks={bannerTracks}
          loading={bannerLoading}
        />
      </section>

      {/* Error State */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 pb-8">
          <div className="text-center py-8 bg-surface/50 rounded-xl border border-muted animate-fade-in">
            <p className="text-muted-foreground mb-3">{error}</p>
            <button
              onClick={fetchAllGenres}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Music Carousels */}
      <div className="space-y-10 pb-16 w-full px-4 sm:px-8 lg:px-12">
        {visibleGenres.map((genre, index) => {
          const state = genreStates[genre.name];
          const seeAllLink = genre.name === 'Trending Now'
            ? '/discover'
            : `/search?q=${encodeURIComponent(genre.query)}`;

          return (
            <AnimatedSection key={genre.name} delay={index * 100}>
              <MusicCarousel
                title={genre.name}
                tracks={state?.tracks || []}
                loading={!state || state.loading}
                seeAllLink={seeAllLink}
              />
            </AnimatedSection>
          );
        })}
      </div>
    </div>
  );
}