import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuthStore } from '../stores/authStore';

export default function AuthListener() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          return;
        }

        try {
          const idToken = await firebaseUser.getIdToken();

          /*
           * Sync Firebase user with the OBLIVION backend.
           *
           * The backend verifies the Firebase ID token
           * and returns the MongoDB user.
           */
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auth/google`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                idToken,
                username:
                  firebaseUser.displayName ||
                  firebaseUser.email?.split('@')[0] ||
                  'User',
              }),
            }
          );

          if (!response.ok) {
            throw new Error(
              'Failed to synchronize user'
            );
          }

          const data = await response.json();

          setUser(data.user);
        } catch (error) {
          console.error(
            'Authentication sync error:',
            error
          );

          /*
           * Firebase authentication is still valid,
           * but backend synchronization failed.
           *
           * Don't immediately destroy the Firebase
           * session here.
           */
        }
      }
    );

    return () => unsubscribe();
  }, [setUser]);

  return null;
}
