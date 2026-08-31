import { useState, useEffect } from 'react';
import { ListMusic, Heart, Plus, Play, Music } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';
import { libraryApi } from '../services/api';
import { Track } from '../types';
import { Link } from 'react-router-dom';
import TrackList from '../components/TrackList';

export default function Library() {
  const { user, isAuthenticated } = useAuthStore();
  const { playTrack } = usePlayerStore();

  const [savedTracks, setSavedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLibrary();
    }
  }, [isAuthenticated, user]);

  const fetchLibrary = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const tracks = await libraryApi.getLibrary(user.id);
      setSavedTracks(tracks);
    } catch (err) {
      console.error('Error fetching library:', err);
      // Demo mode: show empty library
      setSavedTracks([]);
    } finally {
      setLoading(false);
    }
  };

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
          <ListMusic className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Library</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Sign in to save tracks, create playlists, and build your personal music collection.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="border border-muted text-muted-foreground px-6 py-3 rounded-full font-medium hover:border-primary hover:text-primary transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Library</h1>
          <p className="text-muted-foreground mt-1">Your saved music collection</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'}`}
          >
            All ({savedTracks.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'recent' ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-primary hover:bg-muted/50'}`}
          >
            Recent
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/search"
          className="group p-4 bg-surface rounded-xl border border-muted hover:border-primary/50 transition-colors flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold">Add Tracks</h3>
            <p className="text-sm text-muted-foreground">Search and save music</p>
          </div>
        </Link>

        <button
          onClick={() => {
            if (savedTracks.length > 0) {
              playTrack(savedTracks[0], savedTracks);
            }
          }}
          disabled={savedTracks.length === 0}
          className="group p-4 bg-surface rounded-xl border border-muted hover:border-primary/50 transition-colors flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Play className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">Play All</h3>
            <p className="text-sm text-muted-foreground">Shuffle your library</p>
          </div>
        </button>

        <div className="p-4 bg-surface rounded-xl border border-muted flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Music className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold">{savedTracks.length} Tracks</h3>
            <p className="text-sm text-muted-foreground">In your collection</p>
          </div>
        </div>
      </div>

      {/* Tracks */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <TrackSkeleton key={i} />
          ))}
        </div>
      ) : savedTracks.length > 0 ? (
        <div className="space-y-4">
          <TrackList tracks={savedTracks} queue={savedTracks} showHeader showIndex />
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Start exploring and save your favorite tracks to build your personal collection.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Discover Music
          </Link>
        </div>
      )}
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
