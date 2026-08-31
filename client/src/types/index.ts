export interface Track {
  id: number;
  title: string;
  artist: string;
  artistHandle?: string | null;
  duration: number;
  artwork?: string | null;
  streamUrl: string;
  genre?: string | null;
  mood?: string | null;
  releaseDate?: string | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  tracks: Track[];
  createdAt: string;
}
