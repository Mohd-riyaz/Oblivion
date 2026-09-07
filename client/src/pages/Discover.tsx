import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Music, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Track } from '../types';
import { musicApi } from '../services/api';
import MusicCard from '../components/music/MusicCard';
import GenreCard from '../components/GenreCard';
import MoodCard from '../components/MoodCard';
import MusicCarousel from '../components/music/MusicCarousel';

interface GenreConfig {
  name: string;
  query: string;
  gradient: string;
}

const GENRES: GenreConfig[] = [
  { name: 'Pop', query: 'pop', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Hip-Hop', query: 'hip hop', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Electronic', query: 'electronic', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Rock', query: 'rock', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { name: 'R&B', query: 'r&b soul', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Lo-Fi', query: 'lofi chill', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { name: 'Jazz', query: 'jazz', gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { name: 'Classical', query: 'classical', gradient: 'linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)' },
  { name: 'Ambient', query: 'ambient', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Indie', query: 'indie', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'Alternative', query: 'alternative', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { name: 'House', query: 'house', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { name: 'Techno', query: 'techno', gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' },
  { name: 'Metal', query: 'metal', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)' },
  { name: 'Acoustic', query: 'acoustic', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { name: 'Soul', query: 'soul', gradient: 'linear-gradient(135deg, #f5576c 0%, #ff6a88 100%)' },
];

interface MoodConfig {
  name: string;
  query: string;
  gradient: string;
  icon: string;
}

const MOODS: MoodConfig[] = [
  { name: 'Chill', query: 'chill relaxing', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', icon: '🌊' },
  { name: 'Focus', query: 'focus study', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', icon: '🎯' },
  { name: 'Energetic', query: 'energetic upbeat', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', icon: '⚡' },
  { name: 'Late Night', query: 'late night', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🌙' },
  { name: 'Happy', query: 'happy upbeat', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', icon: '☀️' },
  { name: 'Melancholic', query: 'melancholic sad', gradient: 'linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)', icon: '🌧️' },
  { name: 'Dreamy', query: 'dreamy ethereal', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', icon: '✨' },
  { name: 'Workout', query: 'workout gym', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '💪' },
  { name: 'Relax', query: 'relax calm', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', icon: '🧘' },
  { name: 'Party', query: 'party dance', gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', icon: '🎉' },
];

const MORE_GENRES: GenreConfig[] = [
  { name: 'Underground', query: 'underground', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)' },
  { name: 'Instrumental', query: 'instrumental', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { name: 'Experimental', query: 'experimental', gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' },
  { name: 'Funk', query: 'funk', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Reggae', query: 'reggae', gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { name: 'Country', query: 'country', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
];

export default function Discover() {
  const navigate = useNavigate();

  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [freshReleases, setFreshReleases] = useState<Track[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);
  const [moodTracks, setMoodTracks] = useState<Track[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingFresh, setLoadingFresh] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingMood, setLoadingMood] = useState(false);

  // Fetch all discovery data
  useEffect(() => {
    const fetchDiscoveryData = async () => {
      // Fetch trending - use dedicated endpoint
      setLoadingTrending(true);
      try {
        const tracks = await musicApi.getTrending(20);
        console.log('Trending tracks:', tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist })));
        setTrendingTracks(tracks);
      } catch (error) {
        console.error('Error fetching trending:', error);
        setTrendingTracks([]);
      } finally {
        setLoadingTrending(false);
      }

      // Fetch fresh releases - use dedicated endpoint
      setLoadingFresh(true);
      try {
        const tracks = await musicApi.getNewReleases(20);
        console.log('New releases:', tracks.map(t => ({ id: t.id, title: t.title, artist: t.artist })));
        setFreshReleases(tracks);
      } catch (error) {
        console.error('Error fetching new releases:', error);
        setFreshReleases([]);
      } finally {
        setLoadingFresh(false);
      }

      // Fetch recommended (mixed genres) - use search for now
      setLoadingRecommended(true);
      try {
        const recommendedQueries = ['indie alternative', 'electronic dance', 'hip hop rap', 'pop hits'];
        const shuffledQueries = recommendedQueries.sort(() => Math.random() - 0.5);
        const results = await Promise.allSettled(
          shuffledQueries.map(q => musicApi.search(q, 6))
        );
        const allTracks: Track[] = [];
        const seenIds = new Set<number>();
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            result.value.forEach(track => {
              if (!seenIds.has(track.id)) {
                seenIds.add(track.id);
                allTracks.push(track);
              }
            });
          }
        });
        setRecommendedTracks(allTracks.slice(0, 12));
      } catch (error) {
        console.error('Error fetching recommended:', error);
        setRecommendedTracks([]);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchDiscoveryData();
  }, []);

  const handleMoodSelect = useCallback(async (mood: string, query: string) => {
    if (selectedMood === mood) {
      setSelectedMood(null);
      setMoodTracks([]);
      return;
    }

    setSelectedMood(mood);
    setLoadingMood(true);

    try {
      const tracks = await musicApi.search(query, 12);
      setMoodTracks(tracks);
    } catch (error) {
      console.error('Error fetching mood tracks:', error);
      setMoodTracks([]);
    } finally {
      setLoadingMood(false);
    }
  }, [selectedMood]);

  const handleGenreClick = useCallback((query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }, [navigate]);

  return (
    <div className="space-y-12">
      {/* Browse by Genre */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Browse by Genre</h2>
            <p className="text-sm text-muted-foreground">Explore music by style</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
          {GENRES.map((genre) => (
            <GenreCard
              key={genre.name}
              name={genre.name}
              query={genre.query}
              gradient={genre.gradient}
              onClick={handleGenreClick}
            />
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <MusicCarousel
        title="Trending Now"
        tracks={trendingTracks}
        loading={loadingTrending}
        seeAllLink="/discover"
      />

      {/* Fresh Releases */}
      <MusicCarousel
        title="Fresh Releases"
        tracks={freshReleases}
        loading={loadingFresh}
        seeAllLink="/search?q=new+releases"
      />

      {/* Mood Discovery */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">What's Your Mood?</h2>
            <p className="text-sm text-muted-foreground">Music for every feeling</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3 sm:gap-4">
          {MOODS.map((mood) => (
            <MoodCard
              key={mood.name}
              name={mood.name}
              query={mood.query}
              gradient={mood.gradient}
              icon={mood.icon}
              onSelect={handleMoodSelect}
            />
          ))}
        </div>

        {/* Mood Tracks */}
        {selectedMood && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedMood} Tracks
              </h3>
              <button
                onClick={() => {
                  setSelectedMood(null);
                  setMoodTracks([]);
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Clear
              </button>
            </div>

            {loadingMood ? (
              <div className="flex gap-4 sm:gap-6 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-[160px] sm:w-[200px] flex-shrink-0 animate-pulse">
                    <div className="aspect-square rounded-lg bg-muted mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : moodTracks.length > 0 ? (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
                {moodTracks.map((track) => (
                  <div key={track.id} className="w-[160px] sm:w-[200px] flex-shrink-0 snap-start">
                    <MusicCard track={track} queue={moodTracks} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tracks found for this mood. Try another!
              </div>
            )}
          </div>
        )}
      </section>

      {/* Recommended Discovery */}
      <MusicCarousel
        title="Picked for Exploration"
        tracks={recommendedTracks}
        loading={loadingRecommended}
        seeAllLink="/discover"
      />

      {/* More to Explore */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">More to Discover</h2>
            <p className="text-sm text-muted-foreground">Hidden gems and underground sounds</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {MORE_GENRES.map((genre) => (
            <GenreCard
              key={genre.name}
              name={genre.name}
              query={genre.query}
              gradient={genre.gradient}
              onClick={handleGenreClick}
            />
          ))}
        </div>
      </section>
    </div>
  );
}