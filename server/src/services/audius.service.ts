import axios from 'axios';

const AUDIUS_API_URL = 'https://api.audius.co';

const audiusClient = axios.create({
  baseURL: AUDIUS_API_URL,
  timeout: 10000,
});

export interface AudiusTrack {
  track_id: number;
  title: string;
  duration: number;
  genre: string | null;
  mood: string | null;
  release_date: string | null;
  is_streamable: boolean;
  is_downloadable: boolean;

  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };

  stream?: {
    url?: string;
  } | null;

  user?: {
    name?: string;
    handle?: string;
  } | null;
}

export interface OblivionTrack {
  id: number;
  title: string;
  artist: string;
  artistHandle: string | null;
  duration: number;
  artwork: string | null;
  streamUrl: string | null;
  genre: string | null;
  mood: string | null;
  releaseDate: string | null;
}

interface AudiusSearchResponse {
  data: AudiusTrack[];
}

interface AudiusTrendingResponse {
  data: AudiusTrack[];
}

const normalizeTrack = (track: AudiusTrack): OblivionTrack | null => {
  if (!track.is_streamable || !track.stream?.url) {
    return null;
  }

  return {
    id: track.track_id,
    title: track.title,
    artist: track.user?.name || 'Unknown Artist',
    artistHandle: track.user?.handle || null,
    duration: track.duration,
    artwork: track.artwork?.['480x480'] || null,
    streamUrl: track.stream?.url || null,
    genre: track.genre || null,
    mood: track.mood || null,
    releaseDate: track.release_date || null,
  };
};

const deduplicateTracks = (tracks: OblivionTrack[]): OblivionTrack[] => {
  return Array.from(
    new Map(tracks.map(track => [track.id, track])).values()
  );
};

export const searchTracks = async (
  query: string,
  limit = 20
): Promise<OblivionTrack[]> => {
  const apiKey = process.env.AUDIUS_API_KEY;

  const response = await audiusClient.get<AudiusSearchResponse>(
    '/v1/tracks/search',
    {
      params: {
        query,
        limit,
        ...(apiKey ? { app_name: apiKey } : {}),
      },
    }
  );

  const tracks = response.data.data
    .map(normalizeTrack)
    .filter((track): track is OblivionTrack => track !== null);

  return deduplicateTracks(tracks);
};

export const getTrendingTracks = async (
  limit = 20
): Promise<OblivionTrack[]> => {
  const apiKey = process.env.AUDIUS_API_KEY;

  const response = await audiusClient.get<AudiusTrendingResponse>(
    '/v1/tracks/trending',
    {
      params: {
        limit: limit * 2,
        ...(apiKey ? { app_name: apiKey } : {}),
      },
    }
  );

  const tracks = response.data.data
    .map(normalizeTrack)
    .filter((track): track is OblivionTrack => track !== null);

  return deduplicateTracks(tracks).slice(0, limit);
};

export const getNewReleases = async (
  limit = 20
): Promise<OblivionTrack[]> => {
  const apiKey = process.env.AUDIUS_API_KEY;

  const response = await audiusClient.get<AudiusSearchResponse>(
    '/v1/tracks/search',
    {
      params: {
        query: 'new release',
        limit: limit * 2,
        sort: 'release_date',
        ...(apiKey ? { app_name: apiKey } : {}),
      },
    }
  );

  const tracks = response.data.data
    .map(normalizeTrack)
    .filter((track): track is OblivionTrack => track !== null);

  return deduplicateTracks(tracks).slice(0, limit);
};

export const getTracksByGenre = async (
  genre: string,
  limit = 20
): Promise<OblivionTrack[]> => {
  const apiKey = process.env.AUDIUS_API_KEY;

  const response = await audiusClient.get<AudiusSearchResponse>(
    '/v1/tracks/search',
    {
      params: {
        query: genre,
        limit: limit * 2,
        ...(apiKey ? { app_name: apiKey } : {}),
      },
    }
  );

  const tracks = response.data.data
    .map(normalizeTrack)
    .filter((track): track is OblivionTrack => track !== null);

  return deduplicateTracks(tracks).slice(0, limit);
};
