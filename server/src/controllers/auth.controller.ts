import { Request, Response } from 'express';
import { firebaseAuth } from '../config/firebase-admin.js';
import { User } from '../models/user.model.js';

export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({
        error: 'Firebase ID token is required',
      });
      return;
    }

    // Verify the token issued by Firebase
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      res.status(400).json({
        error: 'Google account does not have an email address',
      });
      return;
    }

    const displayName =
      decodedToken.name ||
      email.split('@')[0];

    const avatar = decodedToken.picture || undefined;

    // Find existing user
    let user = await User.findOne({ firebaseUid });

    // If user doesn't exist, create one
    if (!user) {
      let username = displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20);

      if (!username) {
        username = `user${Date.now()}`;
      }

      // Make username unique
      const existingUsername = await User.findOne({ username });

      if (existingUsername) {
        username = `${username}${Date.now().toString().slice(-4)}`;
      }

      user = await User.create({
        firebaseUid,
        email,
        username,
        avatar,
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        firebaseUid: user.firebaseUid,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('Google authentication error:', error);

    if (
      error?.code === 'auth/id-token-expired' ||
      error?.code === 'auth/invalid-id-token'
    ) {
      res.status(401).json({
        error: 'Invalid or expired Firebase token',
      });
      return;
    }

    res.status(500).json({
      error: 'Authentication failed',
    });
  }
};
