import mongoose, { Document, Schema } from 'mongoose';

export interface ILibraryTrack extends Document {
  userId: mongoose.Types.ObjectId;

  audiusTrackId: number;
  title: string;
  artist: string;
  duration: number;

  genre?: string | null;
  mood?: string | null;

  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };

  streamUrl?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const libraryTrackSchema = new Schema<ILibraryTrack>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    audiusTrackId: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    artist: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    genre: {
      type: String,
      default: null,
    },

    mood: {
      type: String,
      default: null,
    },

    artwork: {
      '150x150': String,
      '480x480': String,
      '1000x1000': String,
    },

    streamUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// A user should not be able to save the same Audius track twice.
libraryTrackSchema.index(
  { userId: 1, audiusTrackId: 1 },
  { unique: true }
);

export const LibraryTrack = mongoose.model<ILibraryTrack>(
  'LibraryTrack',
  libraryTrackSchema
);
