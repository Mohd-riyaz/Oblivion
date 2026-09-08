import { Request, Response } from 'express';
import { firebaseAuth as adminAuth } from '../config/firebase-admin.js';
import { User } from '../models/user.model.js';

/**
 * Authenticate a user using a Firebase ID token.
 *
 * Used by:
 * - Email/Password Signup
 * - Google Login
 * - Google Signup
 */
export const firebaseAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken, username } = req.body;

    // Check token
    if (!idToken) {
      res.status(400).json({
        error: 'Firebase ID token is required',
      });
      return;
    }

    // Verify Firebase token
    const decodedToken =
      await adminAuth.verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      res.status(400).json({
        error: 'Firebase account does not have an email address',
      });
      return;
    }

    // Check if MongoDB user already exists
    let user = await User.findOne({
      firebaseUid,
    });

    // Create MongoDB user if it doesn't exist
    if (!user) {
      let finalUsername =
        username?.trim() ||
        decodedToken.name ||
        email.split('@')[0];

      // Convert username to safe format
      finalUsername = finalUsername
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20);

      // Fallback username
      if (!finalUsername) {
        finalUsername = `user${Date.now()}`;
      }

      // Make username unique
      const existingUsername =
        await User.findOne({
          username: finalUsername,
        });

      if (existingUsername) {
        finalUsername =
          `${finalUsername}${Date.now()
            .toString()
            .slice(-4)}`;
      }

      user = await User.create({
        firebaseUid,
        email,
        username: finalUsername,
        avatar:
          decodedToken.picture || undefined,
      });
    }

    // Return user
    res.status(200).json({
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
    console.error(
      'Firebase authentication error:',
      error
    );

    // Expired/invalid Firebase token
    if (
      error?.code === 'auth/id-token-expired' ||
      error?.code === 'auth/invalid-id-token'
    ) {
      res.status(401).json({
        error: 'Invalid or expired Firebase token',
      });
      return;
    }

    // Firebase user doesn't exist / malformed token
    if (
      error?.code === 'auth/user-not-found'
    ) {
      res.status(401).json({
        error: 'Firebase user not found',
      });
      return;
    }

    // Everything else
    res.status(500).json({
      error: 'Authentication failed',
    });
  }
};