import { Play, Pause, MoreHorizontal, Clock } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../stores/playerStore';
import { cn } from '../utils/cn';

interface TrackListProps {
  tracks: Track[];
  queue?: Track[];
  showHeader?: boolean;
  showIndex?: boolean;
  onTrackPlay?: (track: Track) => void;
}

export default function TrackList({ tracks, queue = [], showHeader = true, showIndex = true }: TrackListProps) {
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();

  const handlePlay = (track: Track, _index: number) => {
    if (!track.streamUrl) return;

    const isCurrentTrack = currentTrack?.id === track.id;

    if (isCurrentTrack) {
      usePlayerStore.getState().togglePlay();
      return;
    }

    const playQueue = queue.length > 0 ? queue : tracks;
    playTrack(track, playQueue);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      {showHeader && (
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 text-muted-foreground text-sm border-b border-muted/50 mb-2">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div className="hidden md:block">Artist</div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Tracks */}
      <div className="space-y-1">
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          const isCurrentlyPlaying = isCurrentTrack && isPlaying;

          return (
            <div
              key={track.id}
              className={cn(
                "group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer",
                isCurrentTrack && "bg-muted/20"
              )}
              onClick={() => handlePlay(track, index)}
            >
              {/* Index / Play */}
              <div className="w-8 flex items-center justify-center">
                <span className={cn(
                  "text-muted-foreground text-sm group-hover:hidden",
                  isCurrentTrack && "text-primary"
                )}>
                  {showIndex ? index + 1 : <Play className="w-4 h-4" />}
                </span>
                <button
                  className="hidden group-hover:block text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(track, index);
                  }}
                  aria-label={isCurrentlyPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Title & Artist (Mobile) */}
              <div className="min-w-0 flex flex-col justify-center">
                <div className={cn(
                  "font-medium truncate",
                  isCurrentTrack ? "text-primary" : "text-primary"
                )}>
                  {track.title}
                </div>
                <div className="text-sm text-muted-foreground truncate md:hidden">
                  {track.artist || 'Unknown Artist'}
                </div>
                {track.artwork && (
                  <div className="md:hidden w-10 h-10 rounded overflow-hidden mt-1">
                    <img src={track.artwork} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Artist (Desktop) */}
              <div className="hidden md:flex items-center text-muted-foreground truncate">
                {track.artist || 'Unknown Artist'}
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span>{formatDuration(track.duration)}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
