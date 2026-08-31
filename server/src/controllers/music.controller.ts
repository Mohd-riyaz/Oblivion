import { Request, Response } from 'express';
import {
  searchTracks,
  getTrendingTracks,
  getNewReleases as fetchNewReleases,
  getTracksByGenre,
} from '../services/audius.service.js';

export const searchMusic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = String(req.query.q || '').trim();

    if (!query) {
      res.status(400).json({
        error: 'Search query is required',
      });
      return;
    }

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const tracks = await searchTracks(query, limit);

    res.json({
      success: true,
      count: tracks.length,
      tracks,
    });
  } catch (error) {
    console.error('Audius search error:', error);

    res.status(500).json({
      error: 'Failed to search music',
    });
  }
};

export const getTrending = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const tracks = await getTrendingTracks(limit);

    res.json({
      success: true,
      count: tracks.length,
      tracks,
    });
  } catch (error) {
    console.error('Audius trending error:', error);

    res.status(500).json({
      error: 'Failed to fetch trending tracks',
    });
  }
};

export const getNewReleases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const tracks = await fetchNewReleases(limit);

    res.json({
      success: true,
      count: tracks.length,
      tracks,
    });
  } catch (error) {
    console.error('Audius new releases error:', error);

    res.status(500).json({
      error: 'Failed to fetch new releases',
    });
  }
};

export const getGenreTracks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const genre = String(req.query.genre || '').trim();

    if (!genre) {
      res.status(400).json({
        error: 'Genre is required',
      });
      return;
    }

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const tracks = await getTracksByGenre(genre, limit);

    res.json({
      success: true,
      count: tracks.length,
      tracks,
    });
  } catch (error) {
    console.error('Audius genre error:', error);

    res.status(500).json({
      error: 'Failed to fetch genre tracks',
    });
  }
};