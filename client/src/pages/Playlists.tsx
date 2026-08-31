import { useState } from 'react';
import { Plus, ListMusic, Play, Music, Clock, X, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';
import { Link } from 'react-router-dom';
import { Track } from '../types';

interface Playlist {
  id: string;
  title: string;
  description: string;
  tracks: Track[];
  createdAt: string;
}

export default function Playlists() {
  const { isAuthenticated } = useAuthStore();
  const { playTrack } = usePlayerStore();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  const handleCreatePlaylist = () => {
    if (!newPlaylistTitle.trim()) return;

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title: newPlaylistTitle.trim(),
      description: newPlaylistDescription.trim(),
      tracks: [],
      createdAt: new Date().toISOString(),
    };

    setPlaylists([newPlaylist, ...playlists]);
    setNewPlaylistTitle('');
    setNewPlaylistDescription('');
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
          <ListMusic className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Playlists</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Sign in to create and manage your playlists.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Playlists</h1>
          <p className="text-muted-foreground mt-1">Your personal music collections</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Create Playlist
        </button>
      </header>

      {/* Playlists Grid */}
      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onPlay={() => handlePlayPlaylist(playlist)}
              onDelete={() => handleDeletePlaylist(playlist.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <Music className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create your first playlist to organize your favorite tracks.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Create Your First Playlist
          </button>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-muted rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Playlist</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="playlist-title" className="block text-sm font-medium mb-2">
                  Playlist Name
                </label>
                <input
                  id="playlist-title"
                  type="text"
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="w-full bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-3 outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="playlist-description" className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="playlist-description"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-4 py-3 outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-full font-medium border border-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistTitle.trim()}
                  className="flex-1 px-4 py-3 rounded-full font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: () => void;
  onDelete: () => void;
}

function PlaylistCard({ playlist, onPlay, onDelete }: PlaylistCardProps) {
  const totalDuration = playlist.tracks.reduce((acc, track) => acc + track.duration, 0);
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  return (
    <div className="group bg-surface rounded-xl overflow-hidden border border-muted hover:border-primary/50 transition-colors">
      {/* Cover Art */}
      <div className="relative aspect-square bg-muted">
        {playlist.tracks.length > 0 && playlist.tracks[0].artwork ? (
          <img
            src={playlist.tracks[0].artwork}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-surface">
            <ListMusic className="w-12 h-12 text-muted-foreground/50" aria-hidden="true" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onPlay}
            disabled={playlist.tracks.length === 0}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Play ${playlist.title}`}
          >
            <Play className="w-6 h-6 ml-1" />
          </button>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          aria-label={`Delete ${playlist.title}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold truncate">{playlist.title}</h3>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {playlist.description || `${playlist.tracks.length} tracks`}
        </p>
        {playlist.tracks.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>{formatDuration(totalDuration)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
