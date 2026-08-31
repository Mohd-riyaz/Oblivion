import { Play, Pause } from 'lucide-react';
import { Track } from '../../types';
import { usePlayerStore } from '../../stores/playerStore';
import Artwork from './Artwork';
import { cn } from '../../utils/cn';

interface MusicCardProps {
  track: Track;
  queue?: Track[];
  index?: number;
}

export default function MusicCard({ track, queue = [], index = 0 }: MusicCardProps) {
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track.streamUrl) return;

    if (isCurrentTrack) {
      usePlayerStore.getState().togglePlay();
      return;
    }

    playTrack(track, queue.length > 0 ? queue : [track]);
  };

  return (
    <div
      className={cn(
        "group cursor-pointer transition-transform duration-300 ease-out",
        "hover:-translate-y-1"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Artwork */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
        <Artwork
          src={track.artwork}
          alt={`${track.title} by ${track.artist}`}
          className={cn(
            "w-full h-full transition-transform duration-300 ease-out",
            "group-hover:scale-[1.04]"
          )}
        />

        {/* Play Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80 flex items-end justify-center p-2 transition-all duration-200 ease-out",
          isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}>
          <button
            onClick={handlePlay}
            className={cn(
              "w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg",
              "transition-all duration-200 ease-out",
              "hover:scale-110 hover:shadow-xl hover:shadow-primary/20",
              "active:scale-95",
              isCurrentlyPlaying && "ring-2 ring-primary ring-offset-2 ring-offset-black/50"
            )}
            aria-label={isCurrentlyPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>

        {/* Currently playing indicator */}
        {isCurrentlyPlaying && (
          <div className="absolute top-1.5 left-1.5">
            <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
              <span className="w-0.5 h-2 bg-primary rounded-full animate-playing-bar" />
              <span className="w-0.5 h-3 bg-primary rounded-full animate-playing-bar" style={{ animationDelay: '0.15s' }} />
              <span className="w-0.5 h-2 bg-primary rounded-full animate-playing-bar" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Track Information */}
      <h3 className={cn(
        "font-medium text-sm truncate transition-colors duration-200",
        isCurrentTrack ? "text-primary" : "text-primary"
      )}>
        {track.title}
      </h3>

      <p className="text-xs text-muted-foreground truncate mt-0.5">
        {track.artist || 'Unknown Artist'}
      </p>
    </div>
  );
}
