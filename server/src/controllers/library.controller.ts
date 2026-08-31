import { Request, Response } from 'express';
import { LibraryTrack } from '../models/libraryTrack.model.js';

export const saveTrack = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      audiusTrackId,
      title,
      artist,
      duration,
      genre,
      mood,
      artwork,
      streamUrl,
    } = req.body;

    if (!userId || !audiusTrackId || !title || !artist || !duration) {
      return res.status(400).json({
        error: 'Missing required track information',
      });
    }

    const existingTrack = await LibraryTrack.findOne({
      userId,
      audiusTrackId,
    });

    if (existingTrack) {
      return res.status(409).json({
        error: 'Track already exists in library',
        track: existingTrack,
      });
    }

    const track = await LibraryTrack.create({
      userId,
      audiusTrackId,
      title,
      artist,
      duration,
      genre: genre || null,
      mood: mood || null,
      artwork,
      streamUrl: streamUrl || null,
    });

    return res.status(201).json({
      message: 'Track saved successfully',
      track,
    });
  } catch (error) {
    console.error('Save track error:', error);

    return res.status(500).json({
      error: 'Failed to save track',
    });
  }
};

export const getLibrary = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
      });
    }

    const tracks = await LibraryTrack.find({ userId })
      .sort({ createdAt: -1 });

    return res.json({
      tracks,
    });
  } catch (error) {
    console.error('Get library error:', error);

    return res.status(500).json({
      error: 'Failed to fetch library',
    });
  }
};

export const deleteTrack = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const { audiusTrackId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
      });
    }

    const deletedTrack = await LibraryTrack.findOneAndDelete({
      userId,
      audiusTrackId: Number(audiusTrackId),
    });

    if (!deletedTrack) {
      return res.status(404).json({
        error: 'Track not found in library',
      });
    }

    return res.json({
      message: 'Track removed successfully',
    });
  } catch (error) {
    console.error('Delete track error:', error);

    return res.status(500).json({
      error: 'Failed to delete track',
    });
  }
};
