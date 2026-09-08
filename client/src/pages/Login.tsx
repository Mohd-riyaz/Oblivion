import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Music,
  Loader2,
} from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth, googleProvider } from '../config/firebase';
import { useAuthStore, User } from '../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Send Firebase token to our backend
  const authenticateWithBackend = async (
    idToken: string
  ): Promise<User> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/google`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Backend authentication failed'
      );
    }

    return data.user;
  };

  // -----------------------------
  // Google Login
  // -----------------------------
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const firebaseUser = result.user;

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Authenticate with OBLIVION backend
      const user = await authenticateWithBackend(idToken);

      // Store MongoDB user
      setUser(user);

      navigate('/');
    } catch (error: any) {
      console.error('Google login error:', error);

      if (
        error?.code ===
        'auth/popup-closed-by-user'
      ) {
        setError('Google sign-in was cancelled.');
      } else if (
        error?.code === 'auth/popup-blocked'
      ) {
        setError(
          'Google sign-in popup was blocked by the browser.'
        );
      } else {
        setError(
          error?.message ||
          'Unable to sign in with Google. Please try again.'
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // -----------------------------
  // Email / Password Login
  // -----------------------------
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const result =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const firebaseUser = result.user;

      // IMPORTANT:
      // The current backend endpoint is named /google
      // because we created it for Google authentication.
      //
      // We will create a proper /login endpoint
      // for email/password separately.

      const user: User = {
        id: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        username:
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'User',
        email: firebaseUser.email || '',
        avatar:
          firebaseUser.photoURL || undefined,
      };

      setUser(user);

      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);

      switch (error?.code) {
        case 'auth/invalid-credential':
          setError(
            'Invalid email or password.'
          );
          break;

        case 'auth/user-not-found':
          setError(
            'No account found with this email.'
          );
          break;

        case 'auth/wrong-password':
          setError(
            'Incorrect password.'
          );
          break;

        case 'auth/invalid-email':
          setError(
            'Please enter a valid email address.'
          );
          break;

        case 'auth/too-many-requests':
          setError(
            'Too many attempts. Please try again later.'
          );
          break;

        default:
          setError(
            'Unable to sign in. Please try again.'
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-primary"
          >
            <Music
              className="w-8 h-8"
              aria-hidden="true"
            />
            OBLIVION
          </Link>

          <p className="text-muted-foreground mt-2">
            Your music. Your space.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface/50 border border-muted rounded-2xl p-8 backdrop-blur-sm">

          <h2 className="text-2xl font-bold mb-2">
            Welcome back
          </h2>

          <p className="text-muted-foreground mb-8">
            Sign in to access your library and playlists
          </p>

          {/* Error */}
          {error && (
            <div
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={
              googleLoading || loading
            }
            className="w-full border border-muted bg-muted/40 hover:bg-muted py-3 rounded-full font-medium text-base transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.6c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.7a5.86 5.86 0 0 1 0-3.4V7.77H3.3a9.75 9.75 0 0 0 0 8.46l3.24-2.53Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.27c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.32 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.37l3.24 2.53C7.31 7.99 9.46 6.27 12 6.27Z"
                />
              </svg>
            )}

            {googleLoading
              ? 'Signing in with Google...'
              : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-muted" />

            <span className="text-sm text-muted-foreground">
              or
            </span>

            <div className="flex-1 h-px bg-muted" />
          </div>

          {/* Email Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-10 py-3 text-base outline-none transition-colors"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-10 py-3 text-base outline-none transition-colors pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading || googleLoading
              }
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}

              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
