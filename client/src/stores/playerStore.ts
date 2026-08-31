import { create } from 'zustand';
import { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;

  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  setQueue: (queue: Track[]) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 1,

  playTrack: (track, queue = []) => {
    const tracks = queue.length > 0 ? queue : [track];

    const index = tracks.findIndex(
      (item) => item.id === track.id
    );

    set({
      currentTrack: track,
      queue: tracks,
      currentIndex: index >= 0 ? index : 0,
      isPlaying: true,
    });
  },

  togglePlay: () => {
    const { currentTrack, isPlaying } = get();

    if (!currentTrack) return;

    set({
      isPlaying: !isPlaying,
    });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  resume: () => {
    if (get().currentTrack) {
      set({ isPlaying: true });
    }
  },

  nextTrack: () => {
    const { queue, currentIndex } = get();

    if (queue.length === 0) return;

    const nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      set({
        isPlaying: false,
      });
      return;
    }

    set({
      currentIndex: nextIndex,
      currentTrack: queue[nextIndex],
      isPlaying: true,
    });
  },

  previousTrack: () => {
    const { queue, currentIndex } = get();

    if (queue.length === 0) return;

    const previousIndex =
      currentIndex <= 0 ? 0 : currentIndex - 1;

    set({
      currentIndex: previousIndex,
      currentTrack: queue[previousIndex],
      isPlaying: true,
    });
  },

  setVolume: (volume) => {
    set({
      volume: Math.max(0, Math.min(1, volume)),
    });
  },

  setQueue: (queue) => {
    set({
      queue,
      currentIndex: -1,
    });
  },
}));

export type { Track };