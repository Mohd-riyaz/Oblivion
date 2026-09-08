import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Music,
  Loader2,
} from 'lucide-react';

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';

import { auth, googleProvider } from '../config/firebase';
import { useAuthStore, User as AuthUser } from '../stores/authStore';

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  /*
   * Send Firebase ID token to OBLIVION backend.
   *
   * The backend verifies the token using Firebase Admin
   * and creates/fetches the MongoDB user.
   */
  const authenticateWithBackend = async (
    idToken: string,
    requestedUsername?: string
  ): Promise<AuthUser> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/google`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          username: requestedUsername,
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

  // ---------------------------------------
  // Google Signup
  // ---------------------------------------
  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const firebaseUser = result.user;

      const idToken =
        await firebaseUser.getIdToken();

      const user =
        await authenticateWithBackend(idToken);

      setUser(user);

      navigate('/');
    } catch (error: any) {
      console.error(
        'Google signup error:',
        error
      );

      switch (error?.code) {
        case 'auth/popup-closed-by-user':
          setError(
            'Google sign-up was cancelled.'
          );
          break;

        case 'auth/popup-blocked':
          setError(
            'Google sign-up popup was blocked by the browser.'
          );
          break;

        case 'auth/account-exists-with-different-credential':
          setError(
            'An account already exists with this email. Try signing in instead.'
          );
          break;

        default:
          setError(
            error?.message ||
            'Unable to sign up with Google. Please try again.'
          );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ---------------------------------------
  // Email / Password Signup
  // ---------------------------------------
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');

    // Username validation
    const trimmedUsername =
      username.trim();

    if (trimmedUsername.length < 3) {
      setError(
        'Username must be at least 3 characters.'
      );
      return;
    }

    if (trimmedUsername.length > 20) {
      setError(
        'Username must be 20 characters or less.'
      );
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    setLoading(true);

    try {
      // Create Firebase account
      const result =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const firebaseUser = result.user;

      // Set Firebase display name
      await updateProfile(
        firebaseUser,
        {
          displayName:
            trimmedUsername,
        }
      );

      // Get Firebase token
      const idToken =
        await firebaseUser.getIdToken();

      /*
       * We currently use the same backend
       * authentication endpoint.
       *
       * The backend verifies the Firebase token
       * and creates the MongoDB user.
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
            username: trimmedUsername,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Failed to create OBLIVION profile.'
        );
      }

      setUser(data.user);

      navigate('/');
    } catch (error: any) {
      console.error(
        'Signup error:',
        error
      );

      switch (error?.code) {
        case 'auth/email-already-in-use':
          setError(
            'An account already exists with this email.'
          );
          break;

        case 'auth/invalid-email':
          setError(
            'Please enter a valid email address.'
          );
          break;

        case 'auth/weak-password':
          setError(
            'Password is too weak. Use at least 6 characters.'
          );
          break;

        case 'auth/operation-not-allowed':
          setError(
            'Email/password authentication is not enabled in Firebase.'
          );
          break;

        default:
          setError(
            error?.message ||
            'Unable to create your account. Please try again.'
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">

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

        {/* Signup Card */}
        <div className="bg-surface/50 border border-muted rounded-2xl p-8 backdrop-blur-sm">

          <h2 className="text-2xl font-bold mb-2">
            Create your account
          </h2>

          <p className="text-muted-foreground mb-8">
            Join OBLIVION and start your music journey
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
            onClick={handleGoogleSignup}
            disabled={
              loading ||
              googleLoading
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
              ? 'Creating account...'
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

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Username */}
            <div>

              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
              >
                Username
              </label>

              <div className="relative">

                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                  className="w-full bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-10 py-3 text-base outline-none transition-colors"
                  placeholder="musiclover"
                  minLength={3}
                  maxLength={20}
                  autoComplete="username"
                  required
                />

              </div>

            </div>

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
                    setEmail(
                      e.target.value
                    )
                  }
                  className="w-full bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-10 py-3 text-base outline-none transition-colors"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
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
                    setPassword(
                      e.target.value
                    )
                  }
                  className="w-full bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-10 py-3 text-base outline-none transition-colors pr-12"
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete="new-password"
                  required
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

            {/* Confirm Password */}
            <div>

              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="w-full bg-muted border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-10 py-3 text-base outline-none transition-colors pr-12"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
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
                loading ||
                googleLoading
              }
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}

            </button>

          </form>

          {/* Login */}
          <div className="mt-8 text-center">

            <p className="text-muted-foreground">

              Already have an account?{' '}

              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
