import axios from 'axios';
import { Track } from '../types';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const musicApi = {
  search: async (query: string, limit = 20): Promise<Track[]> => {
    if (!query.trim()) return [];

    const response = await api.get('/music/search', {
      params: {
        q: query,
        limit,
      },
    });

    return response.data.tracks || [];
  },

  getTrending: async (limit = 20): Promise<Track[]> => {
    const response = await api.get('/music/trending', {
      params: {
        limit,
      },
    });

    return response.data.tracks || [];
  },

  getNewReleases: async (limit = 20): Promise<Track[]> => {
    const response = await api.get('/music/new-releases', {
      params: {
        limit,
      },
    });

    return response.data.tracks || [];
  },

  getGenreTracks: async (
    genre: string,
    limit = 20
  ): Promise<Track[]> => {
    const response = await api.get('/music/genre', {
      params: {
        genre,
        limit,
      },
    });

    return response.data.tracks || [];
  },
};

export const libraryApi = {
  getLibrary: async (userId: string): Promise<Track[]> => {
    const response = await api.get('/library', {
      params: {
        userId,
      },
    });

    return response.data.tracks || [];
  },

  saveTrack: async (userId: string, track: Track) => {
    const response = await api.post('/library', {
      userId,
      audiusTrackId: track.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      genre: track.genre,
      mood: track.mood,
      artwork: track.artwork,
      streamUrl: track.streamUrl,
    });

    return response.data;
  },

  removeTrack: async (
    userId: string,
    audiusTrackId: number
  ) => {
    const response = await api.delete(
      `/library/${audiusTrackId}`,
      {
        params: {
          userId,
        },
      }
    );

    return response.data;
  },
};

export default api;